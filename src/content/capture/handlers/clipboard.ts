import type { Trace } from "@/shared/types";


export const cutHandler = (
  event: ClipboardEvent,
): Trace => {
  const data = {} as Trace;
  data.eventType = event.type;

  const clipboardText = event.clipboardData?.getData("text/plain") ?? "";

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
  }

  if (!data.eventValue || data.eventValue.length === 0 && clipboardText) {
    data.eventValue = clipboardText;
  }

  return data;
};

export const copyHandler = (
  event: ClipboardEvent,
) : Trace => {
  const trace = {} as Trace;

  const clipboardText = event.clipboardData?.getData("text/plain") ?? "";

  trace.eventType = event.type;
  trace.textContent = clipboardText;
  trace.timestamp = Date.now();

  const selection = document.getSelection();
  const selectedText = selection ? selection.toString() : "";

  const target = event.target as HTMLElement | null;
  if (target) {
    trace.tag = target.tagName;
    trace.name = (target as HTMLInputElement).name ?? "";
    trace.placeholder = (target as HTMLInputElement).placeholder ?? "";
  }

  if (selectedText !== clipboardText && clipboardText.length < selectedText.length) {
    trace.textContent = selectedText;
    trace.eventState = selectedText;
  }

  return trace;
};

export const pasteHandler = (
  event: ClipboardEvent,
) : Trace => {
  const data = {} as Trace;

  const clipboardText =
    event.clipboardData?.getData("text/plain") ?? "";

  data.eventType = event.type;
  data.eventValue = clipboardText;
  data.textContent = clipboardText;
  data.timestamp = Date.now();
  data.author = "human";

  const target = event.target as HTMLElement | null;
  if (target) {
    data.tag = target.tagName;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      data.name = (target as HTMLInputElement).name ?? "";
      data.placeholder = (target as HTMLInputElement).placeholder ?? "";
      data.startPosition = target.selectionStart ?? undefined;
      data.originValue = target.value;
      data.valueType = typeof target.value;
      data.eventState = target.value;
    }
    else {
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
        data.eventState = eventState;
      }
    }
  }

  return data;
};
