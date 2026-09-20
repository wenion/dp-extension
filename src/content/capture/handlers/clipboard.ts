import { getXPath } from "../utils/xpath";

import type { Trace } from "@/shared/types";


export const cutHandler = (
  event: ClipboardEvent,
): Trace => {
  const data = {} as Trace;
  data.eventType = event.type;

  const clipboardText = event.clipboardData?.getData("text/plain");
  data.eventValue = clipboardText;

  const target = event.target as HTMLElement | null;

  // data.eventType = event.type;
  data.timestamp = Date.now();
  data.author = "human";

  // Case 1: input / textarea
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    data.originValue = target.value; // the original text content before cutting

    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    let text = target.value.slice(start, end);
    if (text.length !== 0) {
      data.eventValue = text;
      data.startPosition = start;
      data.endPosition = end;
    }
    data.eventState = target.value.slice(0, start) + target.value.slice(end); // the text content after cutting
    data.xpath = getXPath(target);
  }
  // Case 2: contenteditable or normal DOM selection
  else if (target instanceof HTMLElement) {
    let eventState = "";
    const editable = target.closest('[contenteditable="true"]');
    if (editable) {
      const paragraphs = editable.querySelectorAll("p, .cm-line, .kix-lineview");

      paragraphs.forEach((p, index) => {
        const text = p.textContent ?? "";
        eventState += text;

        if (index !== paragraphs.length - 1) {
          eventState += "\n";
        }
      });
      data.eventState = eventState; // the text content after cutting
    }
    data.xpath = getXPath(target);
  }

  return data;
};

export const copyHandler = (
  event: ClipboardEvent,
) : Trace => {
  const trace = {} as Trace;

  const clipboardText = event.clipboardData?.getData("text/plain");

  trace.eventType = event.type;
  trace.textContent = clipboardText;
  trace.eventValue = clipboardText;
  trace.timestamp = Date.now();

  const selection = document.getSelection();
  const selectedText = selection ? selection.toString() : "";

  const target = event.target as HTMLElement | null;
  if (target) {
    trace.tag = target.tagName;
    trace.name = (target as HTMLInputElement).name ?? "";
    trace.placeholder = (target as HTMLInputElement).placeholder ?? "";

    trace.xpath = getXPath(target);
  }

  if (!clipboardText) {
    trace.textContent = selectedText;
    trace.eventValue = selectedText;
  }

  return trace;
};

export const pasteHandler = (
  event: ClipboardEvent,
) : Trace => {
  const data = {} as Trace;

  const clipboardText =
    event.clipboardData?.getData("text/plain");

  data.eventType = event.type;
  data.eventValue = clipboardText;
  data.timestamp = Date.now();
  data.author = "human";

  const target = event.target as HTMLElement | null;
  if (target) {
    data.tag = target.tagName;
    data.xpath = getXPath(target);

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      data.name = (target as HTMLInputElement).name ?? "";
      data.placeholder = (target as HTMLInputElement).placeholder ?? "";
      data.startPosition = target.selectionStart ?? undefined;
      data.originValue = target.value;
      data.valueType = typeof target.value;

      if (clipboardText) {
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? start;
        data.startPosition = start;
        data.endPosition =
          start + clipboardText.length;

        data.eventState =
          target.value.slice(0, start) +
          clipboardText +
          target.value.slice(end);
      }
    }
    else {
      const editable = target.closest('[contenteditable="true"]');
      if (editable) {
        let elements: Element[] = [];
        let stateField:
          "originValue" | "eventState" =
            "eventState";

        if (editable.querySelector(".cm-line")) {
          elements = Array.from(
            editable.querySelectorAll(".cm-line"),
          );
        }
        else if (
          editable.querySelector(".kix-lineview")
        ) {
          elements = Array.from(
            editable.querySelectorAll(
              ".kix-lineview",
            ),
          );
        }
        else if (editable.querySelector("p")) {
          elements = Array.from(
            editable.querySelectorAll("p"),
          );

          const isClaude =
            editable.matches(
              '[data-testid="chat-input"]' +
              '[data-cds="Editor"]',
            );

          stateField = isClaude
            ? "eventState"
            : "originValue";
        }

        const state = elements
          .map(element =>
            element.textContent ?? ""
          )
          .join("\n");

        data[stateField] = state;
      }
    }
  }

  return data;
};
