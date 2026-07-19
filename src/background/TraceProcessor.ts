import type { Trace  } from "@/shared/types";


export type DocState = {
  state: string;
  value: string;
  text?: string;
  startPosition?: number;
  endPosition?: number;
  done: boolean;
  // timestamp: number;
  // requestId?: number;
  // tabId: number;
  // sessionId: string;
  type: string;
};

export class TraceProcessor {
  private readonly keyboardState = new Map<number, DocState>();

  private findAllMatches(str: string, sub: string): { start: number; end: number }[] {
    const results = [];
    let index = 0;

    while (true) {
      const start = str.indexOf(sub, index);
      if (start === -1) break;

      results.push({
        start,
        end: start + sub.length - 1,
      });

      index = start + 1; // allow overlap
    }

    return results;
  }

  assignSequence(traces: Trace[]): Trace[] {
    return traces.map((trace, index) => ({
      ...trace,
      sequence: index + 1,
    }));
  }

  processKeyboardEvents(traces: Trace[]): Trace[] {
    const results = [] as Trace[];
    for (const trace of traces) {
      if (trace.eventType === "keydown") {
        if (trace.eventValue === "Enter") {
          const cache: DocState = {
            state: trace.eventState || "",
            value: "\n",
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: true,
            // tabId: trace.tabId,
            // timestamp: trace.timestamp,
            // sessionId: trace.sessionId,
            type: "Insert",
          };
          this.keyboardState.set(trace.tabId, cache);

          const data = {} as Trace;
          data.eventType = "keystroke";
          data.key = "Enter";
          data.code = "Enter";
          data.eventValue = "\n";
          data.eventState = trace.eventState;
          data.startPosition = trace.startPosition ? trace.startPosition : 0;
          data.endPosition = data.startPosition + 1;
          data.url = trace.url;
          data.timestamp = trace.timestamp;
          data.sessionId = trace.sessionId;
          // data.source = "UserEvent";
          data.author = "human";
          data.textContent = trace.textContent;
          data.tag = trace.tag;
          data.elementType = "insert";


          trace.eventType = "keystroke";
          trace.key = "Enter";
          trace.code = "Enter";
          trace.eventValue = "\n";
          trace.startPosition = trace.startPosition ?? 0;
          trace.endPosition = trace.startPosition + 1;
          // data.timestamp = trace.timestamp;
          // data.sessionId = trace.sessionId;
          // data.source = "UserEvent";
          trace.author = "human";
          // data.textContent = trace.textContent;
          // data.tag = trace.tag;
          trace.elementType = "insert";

          // results.push(data);
          results.push(trace);
        }
        else if (trace.key === "Backspace") {
          const start = trace.startPosition;
          const length = trace.eventState?.length || 0;
          const prev = this.keyboardState.get(trace.tabId!);
          const prevState = prev ? prev.state : "";

          if (prevState !== "") {
            if (prevState === trace.eventState) {
              // delete a letter
              const value = prevState.slice(start, start! + 1);
              const cache: DocState = {
                state: trace.eventState || "",
                value: value,
                text: trace.textContent,
                startPosition: start,
                done: trace.startPosition === 0 ? true : false,
                // tabId: trace.tabId!,
                // timestamp: Date.now(),
                type: "Backspace",
              };
              this.keyboardState.set(trace.tabId!, cache);
            }
            else {
              const diff = prevState.length - length;
              if (diff === 1) {
                const value = prevState.slice(start, start! + 1);
                if (value === "\n") {
                  const cache: DocState = {
                    state: trace.eventState || "",
                    value: "\n",
                    text: trace.textContent,
                    startPosition: start! + 1,
                    endPosition: start,
                    done: true,
                    // tabId: trace.tabId!,
                    // timestamp: Date.now(),
                    type: "Backspace",
                  };
                  this.keyboardState.set(trace.tabId!, cache);
                  // output
                  // const data = {} as Trace;
                  // data.eventType = "keystroke";
                  // data.key = "Enter";
                  // data.code = "Enter";
                  // data.eventValue = "\n";
                  // data.eventState = trace.eventState;
                  // data.startPosition = start! + 1;
                  // data.endPosition = start;
                  // data.url = trace.url;
                  // data.timestamp = trace.timestamp;
                  // data.sessionId = trace.sessionId;
                  // // data.source = "UserEvent";
                  // data.author = "human";
                  // data.textContent = trace.textContent;
                  // data.tag = trace.tag;
                  // data.elementType = "delete";


                  trace.eventType = "keystroke";
                  trace.key = "Enter";
                  trace.code = "Enter";
                  trace.eventValue = "\n";
                  trace.startPosition = start! + 1;
                  trace.endPosition = start;
                  trace.author = "human";
                  trace.elementType = "delete";

                  results.push(trace);
                }
              }
              else if (diff === prevState.length) {
                // delete all text
                const cache: DocState = {
                  state: trace.eventState || "",
                  value: prevState,
                  text: trace.textContent,
                  startPosition: prevState.length,
                  endPosition: 0,
                  done: true,
                  // tabId: trace.tabId!,
                  // timestamp: Date.now(),
                  type: "Backspace",
                };
                this.keyboardState.set(trace.tabId!, cache);

                // const data = {} as Trace;
                // data.eventType = "keystroke";
                // data.key = prevState;
                // data.code = prevState;
                // data.eventValue = prevState;
                // data.eventState = trace.eventState;
                // data.startPosition = prevState.length;
                // data.endPosition = 0;
                // data.url = trace.url;
                // data.timestamp = trace.timestamp;
                // data.sessionId = trace.sessionId;
                // // data.source = "UserEvent";
                // data.author = "human";
                // data.textContent = trace.textContent;
                // data.tag = trace.tag;
                // data.elementType = "delete";

                trace.eventType = "keystroke";
                trace.key = prevState;
                trace.code = prevState;
                trace.eventValue = prevState;
                trace.startPosition = prevState.length;
                trace.endPosition = 0;
                trace.author = "human";
                trace.elementType = "delete";

                // results.push(data);
                results.push(trace);
              }
              else {
                // delete a part of the text
                let start = trace.startPosition || 0;
                const result = this.findAllMatches(prevState, trace.eventState || "");
                const match = result.find(m => m.start === start);
                if (match) {
                  start = match.start;
                }
                const cache: DocState = {
                  state: trace.eventState || "",
                  value: prevState.slice(start, diff + start),
                  text: trace.textContent,
                  startPosition: start,
                  endPosition: start + diff,
                  done: true,
                  // tabId: trace.tabId!,
                  // timestamp: Date.now(),
                  type: "Backspace",
                };
                this.keyboardState.set(trace.tabId!, cache);

                // const data = {} as Trace;
                // data.eventType = "keystroke";
                // data.key = prevState.slice(start, diff + start);
                // data.code = prevState.slice(start, diff + start);
                // data.eventValue = prevState.slice(start, diff + start);
                // data.eventState = trace.eventState;
                // data.startPosition = start;
                // data.endPosition = start + diff;
                // data.url = trace.url;
                // data.timestamp = trace.timestamp;
                // data.sessionId = trace.sessionId;
                // // data.source = "UserEvent";
                // data.author = "human";
                // data.textContent = trace.textContent;
                // data.tag = trace.tag;
                // data.elementType = "delete";

                trace.eventType = "keystroke";
                trace.key = prevState.slice(start, diff + start);
                trace.code = prevState.slice(start, diff + start);
                trace.eventValue = prevState.slice(start, diff + start);
                // data.eventState = trace.eventState;
                trace.startPosition = start;
                trace.endPosition = start + diff;
                trace.author = "human";
                trace.elementType = "delete";

                results.push(trace);
                // results.push(data);
              }
            }
          }
          else {
            // empty delete, we can ignore this case
            // but we still need to update the cache
            if (trace.eventState !== "") {
              const cache: DocState = {
                state: trace.eventState || "",
                value: "",
                text: trace.textContent,
                startPosition: trace.startPosition,
                done: false,
                // tabId: trace.tabId!,
                // timestamp: Date.now(),
                type: "Backspace",
              };
              this.keyboardState.set(trace.tabId!, cache);
            }
          }
        }
        else if (trace.key === "Delete") {
          const start = trace.startPosition;

          const prev = this.keyboardState.get(trace.tabId!);
          const prevState = prev ? prev.state : "";
          if (prevState !== "") {
            if (prevState === trace.eventState) {
              // will follow with input event
              const value = prevState.slice(start, start! + 1);
              const cache: DocState = {
                state: trace.eventState || "",
                value: value,
                text: trace.textContent,
                startPosition: start,
                done: false,
                // tabId: trace.tabId!,
                // timestamp: Date.now(),
                type: "Delete",
              };
              this.keyboardState.set(trace.tabId!, cache);
            }
            else {
              const diff = prevState.length - trace.eventState!.length;
              if (diff === 1) {
                const value = prevState.slice(start, start! + 1);
                if (value === "\n") {
                  const cache: DocState = {
                    state: trace.eventState || "",
                    value: "\n",
                    text: trace.textContent,
                    startPosition: start! + 1,
                    endPosition: start,
                    done: true,
                    // tabId: trace.tabId!,
                    // timestamp: Date.now(),
                    type: "Delete",
                  };
                  this.keyboardState.set(trace.tabId!, cache);
                  // output
                  // const data = {} as Trace;
                  trace.eventType = "keystroke";
                  trace.key = "Enter";
                  trace.code = "Enter";
                  trace.eventValue = "\n";
                  // trace.eventState = trace.eventState;
                  trace.startPosition = start! + 1;
                  trace.endPosition = start;
                  // data.url = trace.url;
                  // data.timestamp = trace.timestamp;
                  // data.sessionId = trace.sessionId;
                  // data.source = "UserEvent";
                  trace.author = "human";
                  // data.textContent = trace.textContent;
                  // data.tag = trace.tag;
                  trace.elementType = "delete";

                  // results.push(data);
                  results.push(trace);
                }
              }
              else if (diff === prevState.length) {
                // delete all text
                const cache: DocState = {
                  state: trace.eventState || "",
                  value: prevState,
                  text: trace.textContent,
                  startPosition: prevState.length,
                  endPosition: 0,
                  done: true,
                  // tabId: trace.tabId!,
                  // timestamp: Date.now(),
                  type: "Delete",
                };
                this.keyboardState.set(trace.tabId!, cache);

                // const data = {} as Trace;
                trace.eventType = "keystroke";
                trace.key = prevState;
                trace.code = prevState;
                trace.eventValue = prevState;
                // data.eventState = trace.eventState;
                trace.startPosition = prevState.length;
                trace.endPosition = 0;
                // data.url = trace.url;
                // data.timestamp = trace.timestamp;
                // data.sessionId = trace.sessionId;
                // data.source = "UserEvent";
                trace.author = "human";
                // data.textContent = trace.textContent;
                // data.tag = trace.tag;
                trace.elementType = "delete";

                results.push(trace);
              }
              else {
                let start = trace.startPosition || 0;
                const result = this.findAllMatches(prevState, trace.eventState || "");
                const match = result.find(m => m.start === start);
                if (match) {
                  start = match.start;
                }
                const cache: DocState = {
                  state: trace.eventState || "",
                  value: prevState.slice(start, diff + start),
                  text: trace.textContent,
                  startPosition: start,
                  endPosition: start + diff,
                  done: true,
                  // tabId: trace.tabId!,
                  // timestamp: Date.now(),
                  type: "Delete",
                };
                this.keyboardState.set(trace.tabId!, cache);

                // const data = {} as Trace;
                trace.eventType = "keystroke";
                trace.key = prevState.slice(start, diff + start);
                trace.code = prevState.slice(start, diff + start);
                trace.eventValue = prevState.slice(start, diff + start);
                // data.eventState = trace.eventState;
                trace.startPosition = start;
                trace.endPosition = start + diff;
                // data.url = trace.url;
                // data.timestamp = trace.timestamp;
                // data.sessionId = trace.sessionId;
                // data.source = "UserEvent";
                trace.author = "human";
                // data.textContent = trace.textContent;
                // data.tag = trace.tag;
                trace.elementType = "delete";

                results.push(trace);
              }
            }
          }
          else {
            // TODO try to get the prev state in initialization or navigation event
            if (trace.eventState !== "") {
              const cache: DocState = {
                state: trace.eventState || "",
                value: "",
                text: trace.textContent,
                startPosition: trace.startPosition,
                done: false,
                // tabId: trace.tabId!,
                // timestamp: Date.now(),
                type: "Delete",
              };
              this.keyboardState.set(trace.tabId!, cache);
            }
          }
        }
        else if (trace.key === "Undo" || trace.key === "Redo") {
          const cache: DocState = {
            state: trace.eventState || "",
            value: "",
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: true,
            // tabId: trace.tabId!,
            // timestamp: Date.now(),
            type: "Insert",
          };
          this.keyboardState.set(trace.tabId!, cache);

          // const data = {} as Trace;
          trace.eventType = "keystroke";
          trace.key = trace.key;
          trace.code =trace.key;
          trace.eventValue = "";
          // data.eventState = trace.eventState;
          trace.startPosition = trace.startPosition ? trace.startPosition - 1 : 0;
          trace.endPosition = trace.startPosition + 1;
          // data.url = trace.url;
          // data.timestamp = trace.timestamp;
          // data.sessionId = trace.sessionId;
          // data.source = "UserEvent";
          trace.author = "human";
          // data.textContent = trace.textContent;
          // data.tag = trace.tag;
          trace.elementType = "insert";

          results.push(trace);
        }
        else if (trace.eventValue && trace.eventValue.length === 1) {
          // follow with the input event
          const cache: DocState = {
            state: trace.eventState || "",
            value: trace.eventValue,
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: false,
            // tabId: trace.tabId!,
            // requestId: 0,
            // timestamp: Date.now(),
            type: "Insert",
          };
          this.keyboardState.set(trace.tabId!, cache);
        }
        else {
          const cache: DocState = {
            state: trace.eventState || "",
            value: "",
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: true,
            // tabId: trace.tabId!,
            // timestamp: Date.now(),
            type: "Insert",
          };
          this.keyboardState.set(trace.tabId!, cache);
        }
      }
      else if (trace.eventType === "input") {
        const pre = this.keyboardState.get(trace.tabId!);
        if (pre && !pre.done) {
          let value = "";
          let start = pre.startPosition;
          let end = pre.endPosition;
          let type = pre.type; // "insert" or "delete"
          let direction = "forward"; // or "backward"
          if (pre.type === "Backspace") {
            direction = "backward";
            start = pre.startPosition! - 1;
            end = pre.startPosition;
            value = pre.state.slice(start, end);
            type = "delete";
          }
          else if (pre.type === "Delete") {
            start = pre.startPosition;
            end = pre.startPosition! + 1;
            value = pre.state.slice(start, end);
            type = "delete";
          }
          else if (pre.type === "Insert") {
            // insert letter
            // or maybe replacement
            if (pre.state.length >= trace.eventState!.length) {
              type = "delete";
              const diff = pre.state.length - trace.eventState!.length;
              const remove = pre.state.slice(pre.startPosition, pre.startPosition! + diff + 1);
              const remain = pre.state.slice(0, pre.startPosition) + pre.state.slice(pre.startPosition! + diff + 1);

              // const data = {} as Trace;
              trace.eventType = "keystroke";
              trace.key = remove;
              trace.code = remove;
              trace.eventValue = remove;
              trace.eventState = remain;
              trace.startPosition = pre.startPosition;
              trace.endPosition = pre.startPosition! + diff + 1;
              // data.url = trace.url;
              // data.timestamp = trace.timestamp;
              // data.sessionId = trace.sessionId;
              // data.source = "UserEvent";
              trace.author = "human";
              trace.textContent = pre.text;
              // data.tag = trace.tag;
              trace.elementType = type;

              results.push(trace);
            }

            start = pre.startPosition;
            end = start! + 1;
            value = pre.value;
            type = "insert";
          }

          // add keystroke event
          // const data = {} as Trace;
          trace.eventType = "keystroke";
          // trace.eventState = trace.eventState;
          trace.startPosition = start;
          trace.key = value;
          trace.code = value;
          trace.eventValue = value;
          trace.endPosition = end;
          trace.elementType = type;
          // data.url = trace.url;
          // data.timestamp = trace.timestamp;
          // data.sessionId = trace.sessionId;
          // data.source = "UserEvent";
          trace.author = "human";
          trace.textContent = pre.text;
          // data.tag = trace.tag;
          trace.direction = direction;

          results.push(trace);
          pre.state = trace.eventState || "";
          pre.done = true;
          this.keyboardState.set(trace.tabId!, pre);
        }
      }
      else if (trace.eventType === "paste") {
        if (trace.eventState) {
          const cache: DocState = {
            state: trace.eventState,
            value: "\n",
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: true,
            // tabId: trace.tabId!,
            // timestamp: Date.now(),
            type: "Insert",
          };
          this.keyboardState.set(trace.tabId, cache);
        }

        results.push(trace);
      }
      else if (trace.eventType === "cut") {
        if (trace.eventState) {
          // Google docs without eventState
          const cache: DocState = {
            state: trace.eventState,
            value: trace.eventValue ?? "",
            text: trace.textContent,
            startPosition: trace.startPosition,
            done: true,
            // tabId: trace.tabId!,
            // timestamp: Date.now(),
            type: "Delete",
          };
          this.keyboardState.set(trace.tabId!, cache);

        }
        results.push(trace);
      }
      else {
        const pre = this.keyboardState.get(trace.tabId!);
        if (pre && !pre.done) {
          // add keystroke event
          // const data = {} as Trace;
          trace.eventType = "keystroke";
          trace.eventState = pre.state;
          trace.startPosition = pre.startPosition;
          trace.key = pre.value;
          trace.code = pre.value;
          trace.eventValue = pre.value;
          trace.endPosition = pre.endPosition;
          trace.elementType = pre.type === "Insert" ? "insert" : "delete";
          // data.url = trace.url;
          // data.timestamp = trace.timestamp;
          // data.sessionId = trace.sessionId;
          // data.source = "UserEvent";
          trace.author = "human";
          trace.textContent = pre.text;
          // data.tag = trace.tag;

          results.push(trace);
          pre.done = true;
          this.keyboardState.set(trace.tabId, pre);
        }

        results.push(trace);
      }

    }

    return results;
  }

  processMutationEvents(traces: Trace[]): Trace[] {
    const result: Trace[] = [];

    let pending: Trace | undefined;

    for (const trace of traces) {
      if (trace.eventType === "mutation") {
        if (
          pending &&
          pending.author === trace.author &&
          pending.tabId === trace.tabId &&
          trace.message!.length >= pending.message!.length
        ) {
          pending = trace;
        }
        else {
          if (pending) {
            if (pending.message !== "") {
              result.push(pending);
            }
          }
          pending = trace;
        }
      }
      else {
        if (pending && pending.eventType === "mutation") {
          if (pending.message !== "") {
            result.push(pending);
          }
          pending = undefined;
        }
        // default all push but if is Enter, filter
        if (trace.eventType === "keystroke" && trace.key === "Enter") {

        } else {
          result.push(trace);
        }
      }

    }

    if (pending) {
      if (pending.message !== "") {
        result.push(pending)
      }
    }

    return result;
  }

  processPointerDownEvents(traces: Trace[]): Trace[] {
    const result: Trace[] = [];

    let pending: Trace | undefined;

    for (const trace of traces) {
      if (trace.eventType === "pointerdown") {
        if (
          pending?.eventType === "pointerdown" &&
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

  processGoogleDocsEvents(traces: Trace[]): Trace[] {
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

  process(traces: Trace[]): Trace[] {
    const traces1 = this.processKeyboardEvents(traces);
    const traces2 = this.processMutationEvents(traces1);
    const traces3 = this.processPointerDownEvents(traces2);
    const traces4 = this.processGoogleDocsEvents(traces3);

    return traces4;
  }

  extractDomains(
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
}
