import {
  findFirstDifference,
  isSubsequence,
} from "@/content/capture/utils/string";

import type { Trace  } from "@/shared/types";

export type DocState = {
  state: string;
  value?: string;
  startPosition?: number;
  endPosition?: number;
};

type GroupedTraces = {
  groups: Trace[][];
  otherTraces: Trace[];
};

interface ConversationTurn {
  userAsk?: Trace;
  aiReplys: Trace[];
};

type InitialStateInfo = {
  index: number;
  state: string;
  stateIsPreEvent: boolean;
};

export class TraceProcessorService {

  getDomains(
    traces: readonly Trace[],
  ): string[] {
    return [
      ...new Set(
        traces
          .map(t => t.url)
          .filter(Boolean)
          .map(url => new URL(url).hostname),
      ),
    ];
  }

  prepareTraces(
    traces: Trace[],
  ): Trace[] {
    const traced =
      this.assignSourceSequence(traces);

    const processed =
      this.process(traced);

    return this.assignSequence(processed);
  }

  private assignSourceSequence(
    traces: Trace[],
  ): Trace[] {
    return traces.map((trace, index) => ({
      ...trace,
      sourceSequence: index + 1,
    }));
  }

  private assignSequence(
    traces: Trace[],
  ): Trace[] {
    return traces.map((trace, index) => ({
      ...trace,
      sequence: index + 1,
    }));
  }

  private matchKeydownInputPair(
    keydownTrace: Trace,
    inputTrace?: Trace,
  ): {
    matched: boolean;
    resultState: string;
  } {
    const matched =
      keydownTrace.key !== undefined &&
      this.getInputKey(inputTrace) ===
        keydownTrace.key;

    return {
      matched,
      resultState: matched
        ? inputTrace!.eventState!
        : keydownTrace.eventState!,
    };
  }

  private getInputKey(
    trace?: Trace,
  ): string | undefined {
    if (
      trace?.eventType !== "input" ||
      !trace?.inputType
    ) {
      return undefined;
    }

    switch (trace.inputType) {
      case "deleteContentForward":
      case "deleteWordForward":
        return "Delete";

      case "deleteContentBackward":
      case "deleteWordBackward":
        return "Backspace";

      case "insertText":
        return trace.eventValue;

      case "insertLineBreak":
      case "insertParagraph":
        return "Enter";

      case "historyUndo":
        return "Undo";

      case "historyRedo":
        return "Redo";

      default:
        return undefined;
    }
  }

  private mergeTraces(
    processedTraces: Trace[],
    otherTraces: Trace[],
  ): Trace[] {
    const results: Trace[] = [];

    let i = 0;
    let j = 0;

    while (
      i < processedTraces.length &&
      j < otherTraces.length
    ) {
      const processed = processedTraces[i];
      const other = otherTraces[j];

      if (other.timestamp <= processed.timestamp) {
        results.push(other);
        j++;
      }
      else {
        results.push(processed);
        i++;
      }
    }

    results.push(...processedTraces.slice(i));
    results.push(...otherTraces.slice(j));

    return results;
  }

  private process(traces: Trace[]): Trace[] {
    const {
      groups,
      otherTraces,
    } = this.groupTraces(traces);

    const processedGroups = groups.map(group =>
      this.processKeyboardTraces(
        this.filterTracesByAnchors(group),
      ),
    );

    const processedTraces =
      processedGroups.reduce<Trace[]>(
        (results, group) =>
          this.mergeTraces(results, group),
        [],
      );

    const traces1 = this.mergeTraces(
      processedTraces,
      otherTraces
    );

    const conversationGroups =
      this.groupConversationTraces(traces1);

    const processedConversationGroups =
      conversationGroups.map(group =>
        this.processGroupedMutationTraces(group),
      );

    const traces2 =
      processedConversationGroups.reduce<Trace[]>(
        (results, group) =>
          this.mergeTraces(
            results,
            group,
          ),
        [],
      );

    const traces3 = this.processPointerDownEvents(traces2);
    const traces4 = this.processGoogleDocsEvents(traces3);

    return traces4;
  }

  private groupTraces(
    traces: Trace[],
  ): GroupedTraces {
    // Groups traces by [tabId, url, xpath].
    // Each group represents a possible editing context.
    const groups = new Map<string, Trace[]>();

    // Maps each page [tabId, url] to all editing groups
    // discovered on that page.
    //
    // This allows ambiguous cut/paste events to be assigned
    // to every possible editing context on the same page.
    // page [tab, url] -> [[tab1, urlA, xpathA], [tab1, urlA, xpathB], ...]
    const pageGroups = new Map<string, string[]>();
    const otherTraces: Trace[] = [];

    const getPageKey = (trace: Trace) =>
      JSON.stringify([
        trace.tabId,
        trace.url,
      ]);

    const getGroupKey = (trace: Trace) =>
      JSON.stringify([
        trace.tabId,
        trace.url,
        trace.xpath ?? null,
      ]);

    // Only these event types participate in keyboard
    // trace processing.
    const targetTypes = new Set([
      "keydown",
      "input",
      "cut",
      "paste",
    ]);

    // Pass 1:
    // Discover editing contexts using keydown/input traces
    // with a reliable xpath.
    //
    // These traces act as anchors because their xpath can
    // identify a specific editing context on the page.
    for (const trace of traces) {
      if (
        (trace.eventType !== "keydown" &&
          trace.eventType !== "input") ||
        !trace.xpath
      ) {
        continue;
      }

      const groupKey = getGroupKey(trace);

      if (groups.has(groupKey)) {
        continue;
      }

      groups.set(groupKey, []);

      // Register this editing context under its page so
      // ambiguous events can later find all candidate groups.
      const pageKey = getPageKey(trace);
      const keys = pageGroups.get(pageKey);

      if (keys) {
        keys.push(groupKey);
      }
      else {
        pageGroups.set(pageKey, [groupKey]);
      }
    }

    // Pass 2:
    // Assign target traces to the editing contexts
    // preserve non-target traces, and discard
    // keydown/input traces without a reliable xpath.
    for (const trace of traces) {
      if (!targetTypes.has(trace.eventType ?? "")) {
        otherTraces.push(trace);
        continue;
      }

      const isKeyboardInput =
        trace.eventType === "keydown" ||
        trace.eventType === "input";

      // keydown/input traces with an xpath have a reliable
      // editing context, so assign them only to the exact group.
      //
      // keydown/input traces without an xpath are ignored
      // because their editing context cannot be determined.
      if (isKeyboardInput) {
        if (!trace.xpath) {
          continue;
        }

        groups
          .get(getGroupKey(trace))
          ?.push(trace);

        continue;
      }

      // Ambiguous cut/paste traces:
      // assign to all groups on the same page.
      const pageKey = getPageKey(trace);
      const groupKeys = pageGroups.get(pageKey);

      if (groupKeys?.length) {
        for (const groupKey of groupKeys) {
          groups.get(groupKey)?.push(trace);
        }

        continue;
      }

      // No anchor exists for this page.
      const fallbackKey = JSON.stringify([
        trace.tabId,
        trace.url,
        null,
      ]);

      if (!groups.has(fallbackKey)) {
        groups.set(fallbackKey, []);
        pageGroups.set(pageKey, [fallbackKey]);
      }

      groups.get(fallbackKey)!.push(trace);
    }

    return {
      groups: [...groups.values()],
      otherTraces,
    };
  }

  /**
   * Filters traces using keydown events as anchors.
   *
   * Each keydown and its immediately following input, if any,
   * are preserved. Traces after the previous keydown
   * (+ optional input) and before the next keydown are filtered
   * against the next keydown's state. If no next keydown exists,
   * the remaining traces are preserved unchanged.
   */
  private filterTracesByAnchors(
    traces: Trace[],
  ): Trace[] {
    const filtered: Trace[] = [];

    let index = 0;

    while (index < traces.length) {
      const anchorOffset =
        traces
          .slice(index)
          .findIndex(
            trace =>
              trace.eventType === "keydown",
          );

      if (anchorOffset === -1) {
        filtered.push(
          ...this.reconstructTraceChain(
            traces.slice(index),
          ),
        );
        break;
      }

      const keydownIndex =
        index + anchorOffset;

      const keydown =
        traces[keydownIndex];

      const candidateInput =
        traces[keydownIndex + 1];

      const { matched } =
        this.matchKeydownInputPair(
          keydown,
          candidateInput,
        )

      if (keydownIndex > index) {
        filtered.push(
          ...this.reconstructTraceChain(
            traces.slice(
              index,
              keydownIndex,
            ),
            matched
              ? keydown.eventState
              : undefined,
          ),
        );
      }

      filtered.push(keydown);

      if (matched) {
        // keydown + input are treated as one pair.
        filtered.push(candidateInput);

        index = keydownIndex + 2;
      }
      else {
        // Only consume the keydown.
        // The following input, if any,
        // will be processed independently.
        index = keydownIndex + 1;
      }
    }

    return filtered;
  }

  /**
   * Reconstructs a valid trace chain leading to the target state.
   *
   * Uses the latest trace matching the target state as the anchor,
   * then walks backward to retain preceding traces whose state
   * transitions are consistent with the current trace.
   */
  private reconstructTraceChain(
    traces: Trace[],
    targetState?: string,
  ): Trace[] {
    if (traces.length === 0) {
      return [];
    }

    let anchorIndex = traces.length - 1;

    // If targetState is provided,
    // determine whether the latest trace can lead to it.
    if (targetState !== undefined) {
      anchorIndex = -1;

      // Find the latest trace whose state
      // exactly matches the target state.
      for (let i = traces.length - 1; i >= 0; i--) {
        const trace = traces[i];

        if (
          (
            trace.eventType === "cut" ||
            trace.eventType === "input"
          ) &&
          trace.eventState === targetState
        ) {
          anchorIndex = i;
          break;
        }

        if (trace.eventType === "paste") {
          anchorIndex = i;
          break;
        }
      }

      // No matching anchor found.
      if (anchorIndex === -1) {
        return [];
      }
    }

    // Step 2:
    // Reconstruct the chain backward
    // from the anchor.
    const chain: Trace[] = [];

    let current = traces[anchorIndex];

    chain.push(current);

    // Walk backward from anchorIndex - 1.
    for (let i = anchorIndex - 1; i >= 0; i--) {
      const prev = traces[i];

      if (current.eventType === "cut") {
        if (
          current.eventState !== undefined &&
          prev.eventState !== undefined &&
          isSubsequence(
            prev.eventState,
            current.eventState,
          )
        ) {
          chain.push(prev);
          current = prev;
        }
        else if (
          prev.eventType === "paste" &&
          prev.eventState === undefined
        ) {
          // Keep a preceding paste when its post-state
          // is unavailable, since the cut transition
          // cannot be validated by state comparison.
          chain.push(prev);
          current = prev;
        }

        continue;
      }

      if (
        current.eventType === "paste" ||
        current.eventType === "input"
      ) {
        chain.push(prev);
        current = prev;

        continue;
      }
    }

    chain.reverse();

    return chain;
  }

  private processKeyboardTraces(
    traces: Trace[],
  ): Trace[] {
    const results = [] as Trace[];

    if (traces.length === 0) {
      return results;
    }

    let initialStateInfo: InitialStateInfo | undefined;

    let index = 0;

    // init contentState
    while (index < traces.length) {
      const current: Trace = traces[index];
      const eventType = current.eventType;

      let state: string | undefined;
      let stateIsPreEvent = false;

      if (eventType === "keydown") {
        const keydownState = current.eventState;

        if (
          !keydownState ||
          !current.key ||
          current.reason
        ) {
          index++;
          continue;
        }

        const { matched, resultState } =
          this.matchKeydownInputPair(
            current,
            traces[index + 1],
          );

        if (matched) {
          stateIsPreEvent = true;
        }

        state = resultState;
        stateIsPreEvent = matched;
      }
      else if (eventType === "paste") {
        if (current.originValue !== undefined) {
          state = current.originValue;
          stateIsPreEvent = true;
        }
        else if (current.eventState !== undefined) {
          state = current.eventState;
        }
      }
      else if (current.eventState !== undefined) {
        state = current.eventState;
      }

      if (state === undefined) {
        index++;
        continue;
      }

      initialStateInfo = {
        index,
        state,
        stateIsPreEvent,
      };

      break;
    }

    if (initialStateInfo === undefined) {
      return [];
    }

    let contentState: DocState = {
      state: initialStateInfo.state,
    };

    index = initialStateInfo.stateIsPreEvent
      ? initialStateInfo.index
      : initialStateInfo.index + 1;

    while (index < traces.length) {
      const current: Trace = traces[index];

      const eventType = current.eventType;

      if (eventType === "keydown") {
        const key = current.key;
        const keydownState = current.eventState;

        if (!keydownState || !key || current.reason) {
          index += 1;
          continue;
        }

        const nextTrace: Trace | undefined =
          traces[index + 1];

        const {
          matched,
          resultState,
        } = this.matchKeydownInputPair(
          current,
          nextTrace,
        );

        if (matched) {
          // the following input is corresponding to Keydown
          // correct contentState
          contentState = {
            ...contentState,
            state: keydownState,
          };
        }

        let nextState = resultState;

        let pos = current.startPosition ?? findFirstDifference(
          contentState.state,
          nextState,
        );

        if (key === "Enter") {
          const preState = contentState.state;

          // Since Enter inserts one character ("\n"),
          // infer how many existing characters were replaced.
          const removedLength =
            preState.length - nextState.length + 1;

          if (removedLength >= 0) {
            const expectedState =
              preState.slice(0, pos) +
              "\n" +
              preState.slice(pos + removedLength);

            if (expectedState === nextState) {
              if (removedLength > 0) {
                const remove =
                  preState.slice(
                    pos,
                    pos + removedLength,
                  );

                const remain =
                  preState.slice(0, pos) +
                  preState.slice(pos + removedLength);

                const deleteTrace: Trace = {
                  ...current,
                  eventType: "keystroke",
                  key: remove,
                  code: remove,
                  eventValue: remove,
                  eventState: remain,
                  startPosition: pos,
                  endPosition: pos + removedLength,
                  elementType: "delete",
                };

                results.push(deleteTrace);
              }

              const trace: Trace = {
                ...current,
                eventType: "keystroke",
                key: "Enter",
                code: "Enter",
                eventValue: "\n",
                eventState: nextState,
                startPosition: pos,
                endPosition: pos + 1,
                elementType: "insert",
              }
              results.push(trace);
            }
            else {
              // State transition cannot be explained
              // by this Enter event.
              results.push(current);
            }

            contentState = {
              ...contentState,
              state: nextState,
              value: "\n",
              startPosition: pos,
            };
          }
        }
        else if (key === "Backspace") {
          const diff: number =
            contentState.state.length - nextState.length;

          if (diff === 1) {
            // pos is backward
            const start = pos - diff;
            const end = pos;

            const remove = contentState.state.slice(start, end);
            const remain = contentState.state.slice(0, start) + contentState.state.slice(start + diff);

            const deleteTrace: Trace = {
              ...current,
              eventType: "keystroke",
              key: remove,
              code: remove,
              eventValue: remove,
              eventState: remain,
              startPosition: start,
              endPosition: end,
              direction: "backward",
              elementType: "delete",
            };

            results.push(deleteTrace);

            contentState = {
              ...contentState,
              state: nextState,
              value: remove,
              startPosition: start,
            }
          }
          else if (diff > 1) {
            // Backspace more
            const remove = contentState.state.slice(pos, pos + diff);
            const remain = contentState.state.slice(0, pos) + contentState.state.slice(pos + diff);

            const deleteTrace: Trace = {
              ...current,
              eventType: "keystroke",
              key: remove,
              code: remove,
              eventValue: remove,
              eventState: remain,
              startPosition: pos,
              endPosition: pos + diff,
              direction: "backward",
              elementType: "delete",
            };

            results.push(deleteTrace);

            contentState = {
              ...contentState,
              state: nextState,
              value: remove,
              startPosition: pos,
            }
          }
          else if (diff === 0) {
            contentState = {
              ...contentState,
              state: nextState,
              value: "",
              startPosition: pos,
            }
          }
        }
        else if (key === "Delete") {
          const diff: number =
            contentState.state.length - nextState.length;

          if (diff > 0) {
            // Delete one or more
            const remove = contentState.state.slice(pos, pos + diff);
            const remain = contentState.state.slice(0, pos) + contentState.state.slice(pos + diff);

            const deleteTrace: Trace = {
              ...current,
              eventType: "keystroke",
              key: remove,
              code: remove,
              eventValue: remove,
              eventState: remain,
              startPosition: pos,
              endPosition: pos + diff,
              direction: "forward",
              elementType: "delete",
            };

            results.push(deleteTrace);
          }

          contentState = {
            ...contentState,
            state: nextState,
            value: diff > 0 ? contentState.state.slice(pos, pos + diff) : "",
            startPosition: pos,
          }
        }
        else if (key === "Undo" || key === "Redo") {
          const trace: Trace = {
            ...current,
            eventType: "keystroke",
            key,
            eventState: nextState,
            elementType: key.toLowerCase(),
          };

          results.push(trace);

          contentState = {
            ...contentState,
            state: nextState,
            value: "",
          };
        }
        else if (key.length === 1) {
          const preState = contentState.state;
          const insertValue = key;

          // Infer how many existing characters were replaced.
          const removedLength =
            preState.length +
            insertValue.length -
            nextState.length;

          if (removedLength >= 0) {
            const expectedState =
              preState.slice(0, pos) +
              insertValue +
              preState.slice(pos + removedLength);

            if (expectedState === nextState) {
              if (removedLength > 0) {
                const remove =
                  preState.slice(
                    pos,
                    pos + removedLength,
                  );

                const remain =
                  preState.slice(0, pos) +
                  preState.slice(pos + removedLength);

                const deleteTrace: Trace = {
                  ...current,
                  eventType: "keystroke",
                  key: remove,
                  code: remove,
                  eventValue: remove,
                  eventState: remain,
                  startPosition: pos,
                  endPosition: pos + removedLength,
                  elementType: "delete",
                };

                results.push(deleteTrace);
              }

              const trace: Trace = {
                ...current,
                eventType: "keystroke",
                eventValue: insertValue,
                eventState: nextState,
                startPosition: pos,
                endPosition: pos + insertValue.length,
                elementType: "insert",
              }

              results.push(trace);
            }
            else {
              // The observed state transition cannot be
              // explained by this keystroke.
              results.push(current);
            }
          }

          contentState = {
            ...contentState,
            state: nextState,
            value: insertValue,
            startPosition: pos,
          }
        }
        else {
          contentState = {
            ...contentState,
            state: nextState,
          }
        }

        if (matched) {
          index += 2;
          continue;
        }
      }
      else if (eventType === "input") {
        // miss pre keydown
        const inputState = current.eventState;

        if (inputState) {
          const diff =
            contentState.state.length - inputState.length;
          
          if (diff !== 0) {
            const inputType = current.inputType;

            let inputKey: string | undefined =
              undefined;

            if (
              inputType === "deleteContentForward" ||
              inputType === "deleteWordForward"
            ) {
              inputKey = "Delete";
            }
            else if (
              inputType === "deleteContentBackward" ||
              inputType === "deleteWordBackward"
            ) {
              inputKey = "Backspace";
            }
            else if (inputType === "insertText") {
              inputKey = current.eventValue;
            }
            else if (
              inputType === "insertLineBreak" ||
              inputType === "insertParagraph"
            ) {
              inputKey = "Enter";
            }
            else if (inputType === "historyUndo") {
              inputKey = "Undo";
            }
            else if (inputType === "historyRedo") {
              inputKey = "Redo";
            }
            //"insertCompositionText"

            if (inputKey === "Backspace" || inputKey === "Delete") {

            }

          }

          contentState = {
            ...contentState,
            state: inputState,
          };
        }
      }
      else if (eventType === "paste") {
        let eventState = current.eventState;

        if (eventState === undefined) {
          const next = traces[index + 1];

          if (next?.eventType === "keydown") {
            const keydownTrace = next;

            const { matched } =
              this.matchKeydownInputPair(
                keydownTrace,
                traces[index + 2],
              );

            if (matched) {
              eventState = keydownTrace.eventState;
            }
          }
          else if (
            next?.eventType === "paste" &&
            next?.originValue !== undefined
          ) {
            eventState = next.originValue;
          }
        }

        if (eventState !== undefined) {
          const originValue = current.originValue;
          const pasteValue = current.eventValue;

          if (
            originValue !== undefined &&
            pasteValue !== undefined
          ) {
            const startPosition =
              eventState.indexOf(pasteValue);

            if (
              startPosition !== -1 &&
              startPosition ===
                eventState.lastIndexOf(pasteValue)
            ) {
              const afterPastePosition =
                startPosition + pasteValue.length;

              const prefix =
                eventState.slice(0, startPosition);

              const suffix =
                eventState.slice(afterPastePosition);

              const endPosition =
                originValue.length - suffix.length;

              if (
                endPosition >= startPosition &&
                originValue.slice(0, startPosition) === prefix &&
                originValue.slice(endPosition) === suffix
              ) {
                current.startPosition = startPosition;
                current.endPosition = endPosition;
              }
            }
          }

          current.eventState = eventState;

          contentState = {
            ...contentState,
            state: eventState,
          };
        }

        results.push(current);
      }
      else if (eventType === "cut") {
        const cutState = current.eventState;

        if (cutState) {
          let pos =
            current.startPosition ??
            findFirstDifference(
              contentState.state,
              cutState,
            );

          const diff =
            contentState.state.length -
            cutState.length;

          if (pos >= 0 && diff > 0) {
            const remove =
              contentState.state.slice(
                pos,
                pos + diff,
              );

            if (remove === current.eventValue) {
              current.startPosition = pos;
              current.endPosition = pos + diff;
            }
            else {
              const origin =
                cutState.slice(0, pos) +
                remove +
                cutState.slice(pos);

              if (origin === contentState.state) {
                current.startPosition = pos;
                current.endPosition = pos + diff;
              }
            }
          }

          contentState = {
            ...contentState,
            state: cutState,
          };
        }

        results.push(current);
      }
      else {
        if (current.eventState) {
          contentState = {
            ...contentState,
            state: current.eventState,
          }
        }
      }

      index += 1;
    }

    return results;
  }

  private keepLongestMutationMessages(
    traces: Trace[],
  ): Trace[] {
    const results: Trace[] = [];

    for (const trace of traces) {
      const message = trace.message;

      if (message === undefined) {
        continue;
      }

      let shouldAdd = true;

      for (let i = results.length - 1; i >= 0; i--) {
        const existingMessage =
          results[i].message;

        if (existingMessage === undefined) {
          continue;
        }

        // Current is a longer version.
        if (message.startsWith(existingMessage)) {
          results.splice(i, 1);
          continue;
        }

        // Existing is already a longer version.
        if (existingMessage.startsWith(message)) {
          shouldAdd = false;
          break;
        }
      }

      if (shouldAdd) {
        results.push(trace);
      }
    }

    return results;
  }

  private filterMutationTraces(
    traces: Trace[],
  ): Trace[] {
    const filtered: Trace[] = [];

    let lastMutation: Trace | undefined;
    let lastMutationIndex: number | undefined;

    for (const trace of traces) {
      if (trace.eventType !== "mutation") {
        filtered.push(trace);
        continue;
      }
      
      if (trace.message === undefined) {
        continue;
      }

      if (
        lastMutation &&
        lastMutationIndex !== undefined &&
        lastMutation.author === trace.author &&
        lastMutation.tabId === trace.tabId &&
        trace.message.startsWith(lastMutation.message!)
      ) {
        // Remove the previous mutation from its old position.
        filtered.splice(lastMutationIndex, 1);
      }

      // Keep current mutation at its actual position.
      filtered.push(trace);

      lastMutation = trace;
      lastMutationIndex = filtered.length - 1;
    }

    return filtered;
  }

  private groupConversationTraces(
    traces: Trace[],
  ): Trace[][] {
    const traceGroups =
      new Map<number, Trace[]>();

    for (const trace of traces) {
      if (trace.tabId === undefined) {
        continue;
      }

      const group =
        traceGroups.get(trace.tabId);

      if (group) {
        group.push(trace);
      } else {
        traceGroups.set(
          trace.tabId,
          [trace],
        );
      }
    }

    return [...traceGroups.values()];
  }

  private processGroupedMutationTraces(
    traces: Trace[],
  ): Trace[] {
    const filteredTraces =
      this.filterMutationTraces(traces);

    const turns: ConversationTurn[] = [];
    const allAIReplys: Trace[] = [];

    let index = 0;

    while (index < filteredTraces.length) {
      const trace = filteredTraces[index];

      if (trace.eventType !== "mutation") {
        index++;
        continue;
      }

      if (trace.author === "human") {
        const turn: ConversationTurn = {
          userAsk: trace,
          aiReplys: [],
        };

        let nextIndex = index + 1;

        while (nextIndex < filteredTraces.length) {
          const nextTrace =
            filteredTraces[nextIndex];

          if (nextTrace.eventType !== "mutation") {
            nextIndex++;
            continue;
          }

          if (
            nextTrace.author === "human" ||
            nextTrace.author === undefined
          ) {
            break;
          }

          if (nextTrace.author === "AI") {
            turn.aiReplys.push(nextTrace);
          }

          nextIndex++;
        }

        if (turn.aiReplys.length > 0) {
          turn.aiReplys =
            this.keepLongestMutationMessages(
              turn.aiReplys,
            );
        }

        turns.push(turn);

        allAIReplys.push(...turn.aiReplys);
        // Continue from where we stopped collecting.
        index = nextIndex;
        continue;
      }

      if (trace.author === "AI") {
        index++;
        continue;
      }

      if (trace.author === undefined) {
        const message = trace.message;

        if (message === undefined) {
          index++;
          continue;
        }

        const matchesUserAsk =
          turns.some(
            turn =>
              turn.userAsk?.message === message,
          );

        if (matchesUserAsk) {
          index++;
          continue;
        }

        const turn: ConversationTurn = {
          aiReplys: [trace, ],
        };

        turns.push(turn);

        allAIReplys.push(...turn.aiReplys);

        index++;
        continue;
      }

      index++;
    }

    const finalAIReplys =
      this.keepLongestMutationMessages(
        allAIReplys,
      );

    const keptSourceSequences =
      new Set<number>();

    for (const turn of turns) {
      if (
        turn.userAsk &&
        turn.aiReplys.length > 0
      ) {
        const allRepliesKept =
          turn.aiReplys.every(
            reply =>
              finalAIReplys.some(
                finalReply =>
                  finalReply.sourceSequence ===
                  reply.sourceSequence,
              ),
          );

        let shouldKeep = allRepliesKept;

        if (shouldKeep) {
          keptSourceSequences.add(
            turn.userAsk.sourceSequence!,
          );
        }
      }
    }

    for (const turn of turns) {
      const userAskSequence =
        turn.userAsk?.sourceSequence;

      if (
        userAskSequence !== undefined &&
        keptSourceSequences.has(userAskSequence)
      ) {
        for (const reply of turn.aiReplys) {
          if (reply.sourceSequence !== undefined) {
            keptSourceSequences.add(
              reply.sourceSequence,
            );
          }
        }
      }
    }

    const result: Trace[] = [];

    for (const trace of filteredTraces) {
      if (trace.eventType !== "mutation") {
        result.push(trace);
        continue;
      }

      if (
        trace.sourceSequence !== undefined &&
        keptSourceSequences.has(
          trace.sourceSequence,
        )
      ) {
        result.push(trace);
      }
    }

    return result;
  }

  private processPointerDownEvents(traces: Trace[]): Trace[] {
    const result: Trace[] = [];

    let pending: Trace | undefined;

    for (const trace of traces) {
      if (trace.eventType === "pointerdown") {
        if (
          pending?.textContent === trace.textContent &&
          pending?.tabId === trace.tabId &&
          pending?.xpath === trace.xpath
        ) {
          pending = trace;
        }
        else {
          if (pending) {
            result.push(pending);
          }
          pending = trace;
        }
      }
      else {
        if (pending) {
          result.push(pending);
          pending = undefined;
        }

        result.push(trace);
      }
    }

    if (pending) {
      result.push(pending)
    }

    return result;
  }

  private processGoogleDocsEvents(traces: Trace[]): Trace[] {
    const result: Trace[] = [];

    let pending: Trace | undefined;
    let last: Trace |undefined;
    let skip = 0;

    for (const trace of traces) {

      if (skip > 0) {
        if (
          trace.eventType === "keystroke" &&
          trace.elementType === "insert"
        ) {
          last = trace;
          skip--;
          continue;
        }

        result.push(trace);
        continue;
      }

      // skip done
      if (pending) {
        if (last) {
          pending.eventState = last.eventState;
        }

        result.push(pending);
        pending = undefined;
        last = undefined;
      }

      // Google Docs paste
      if (
        trace.eventType === "paste" &&
        trace.url.startsWith("https://docs.google.com/document/")
      ) {
        pending = trace;
        skip = trace.eventValue?.length ?? 0;
        continue;
      }

      result.push(trace);
    }

    // paste is last
    if (pending) {
      if (last) {
        pending.eventState = last.eventState;
      }

      result.push(pending);
    }

    return result;
  }
}
