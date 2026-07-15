import { getXPath } from "../utils/xpath";
import { getVisibleFormFieldIndex } from "../utils/formFieldIndex.ts";

import type { Trace } from "@/shared/types";


type CaretInfo = {
  absolutePosition: number;
  line: number;     // 0-based
  column: number;   // 0-based
};

function getCaretInfo(target: HTMLElement, key?: string): CaretInfo | null {

  // ============================
  // 1 TEXTAREA / INPUT
  // ============================
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {

    const value = target.value;
    const start = target.selectionStart ?? 0;

    const before = value.slice(0, start);
    const lines = before.split("\n");

    return {
      absolutePosition: start,
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);

  // ============================
  // 2 CodeMirror (Overleaf)
  // ============================
  if (target.classList.contains("cm-content")) {

    const container = range.startContainer;

    const lineEl =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest(".cm-line")
        : (container as HTMLElement).closest(".cm-line");

    if (!lineEl) return null;

    const lines = Array.from(target.querySelectorAll(".cm-line"));
    const lineIndex = lines.indexOf(lineEl);

    let absolutePosition = 0;

    for (let i = 0; i < lineIndex; i++) {
      absolutePosition += (lines[i].textContent ?? "").length + 1;
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(lineEl);
    preRange.setEnd(range.startContainer, range.startOffset);

    const column = preRange.toString().length;

    return {
      absolutePosition: absolutePosition + column,
      line: lineIndex,
      column
    };
  }

  // ============================
  // 3 ProseMirror (ChatGPT / Notion)
  // ============================
  if (target.querySelector("p")) {

    const container = range.startContainer;

    const paragraphs = Array.from(target.querySelectorAll("p"));

    const currentParagraph =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest("p")
        : (container as HTMLElement).closest("p");

    if (!currentParagraph) return null;

    let paragraphIndex = paragraphs.indexOf(currentParagraph); // paragraphIndex is 0-based index

    if (key === "Enter") {
      // DOM structure changes
      paragraphIndex = paragraphIndex - 1;
    }

    let absolutePosition = 0;

    for (let i = 0; i < paragraphIndex; i++) {
      absolutePosition += (paragraphs[i].textContent ?? "").length;
      if ((paragraphs[i + 1].textContent ?? "").length > 0) {
        // next paragraph has text, so add 1 for the newline
        absolutePosition += 1;
      }
      else if ((paragraphs[i + 1].textContent ?? "").length === 0 && key !== "Enter") {
        // next paragraph is empty, but user didn't just press Enter, so add 1 for the newline
        absolutePosition += 1;
      }
      else if ((paragraphs[i + 1].textContent ?? "").length === 0 && paragraphs[i + 2]?.textContent !== undefined) {
        // next paragraph is empty, but there is a next next paragraph, so add 1 for the newline
        absolutePosition += 1;
      }
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(currentParagraph);
    preRange.setEnd(range.startContainer, range.startOffset);

    absolutePosition += preRange.toString().length;

    // 3 Convert to line + column
    const line = paragraphIndex;
    const column = preRange.toString().length;

    return {
      absolutePosition,
      line,
      column
    };
  }

  // ============================
  // 4 Google Docs
  // ============================
  if (target.querySelector(".kix-lineview")) {

    const container = range.startContainer;

    const lines = Array.from(document.querySelectorAll(".kix-lineview"));

    const currentLine =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest(".kix-lineview")
        : (container as HTMLElement).closest(".kix-lineview");

    if (!currentLine) return null;

    const lineIndex = lines.indexOf(currentLine);

    let absolutePosition = 0;

    for (let i = 0; i < lineIndex; i++) {
      absolutePosition += (lines[i].textContent ?? "").length + 1;
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(currentLine);
    preRange.setEnd(range.startContainer, range.startOffset);

    const column = preRange.toString().length;

    return {
      absolutePosition: absolutePosition + column,
      line: lineIndex,
      column
    };
  }

  // ============================
  // 5 Generic contenteditable fallback
  // ============================

  const preRange = range.cloneRange();
  preRange.selectNodeContents(target);
  preRange.setEnd(range.startContainer, range.startOffset);

  const text = preRange.toString();
  const lines = text.split("\n");

  return {
    absolutePosition: text.length,
    line: lines.length - 1,
    column: lines[lines.length - 1].length
  };
}

export const keyDownHandler = (
  event: KeyboardEvent,
) : Trace => {
  const data = {} as Trace;
  data.eventType = event.type;
  const target = event.target;

  if (!target) return data;

  const isNativeInput =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement;

  const isInContentEditable =
    (target as HTMLElement).isContentEditable;

  if (!isNativeInput && !isInContentEditable) return data;

  const isUndo =
    (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";

  const isRedo =
    (event.ctrlKey || event.metaKey) &&
    (
      (event.shiftKey && event.key.toLowerCase() === "z") || // Mac / some apps
      event.key.toLowerCase() === "y" // Windows redo
    );

  const MODIFIER_KEYS = new Set([
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock"
  ]);

  const isModifierOnly = MODIFIER_KEYS.has(event.key);

  // ignore modifier-only presses (Shift, Ctrl, etc.)
  if (isModifierOnly) return data;

  // ignore most shortcuts EXCEPT undo/redo
  if (
    (event.ctrlKey || event.metaKey || event.altKey) &&
    !isUndo &&
    !isRedo
  ) {
    return data;
  }

  // data.eventType = event.type;

  data.tag = (target as Element).tagName;
  data.name = (target as any).name;
  data.textContent = (target as Element).textContent;
  data.clientX = NaN;
  data.clientY = NaN;
  data.width = window.innerWidth;
  data.height = window.innerHeight;
  data.xpath = target instanceof Element ? getXPath(target) : "";

  data.code = event.code;
  data.key = event.key;
  if (isUndo || isRedo) {
    data.key = isUndo ? "Undo" : "Redo";
    data.code = data.key;
  }
  data.timestamp = Date.now();

  data.author = "human";

  // TODO escape characters eventValue should be null for non-character keys
  data.eventValue = data.key;
  data.eventState = data.textContent;

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    data.eventState = target.value;
    data.startPosition = target.selectionStart ?? undefined;
  }
  else if (target instanceof HTMLElement && target.isContentEditable) {
    let eventState = "";
    if (target) {
      const paragraphs = target.querySelectorAll("p, .cm-line, .kix-lineview");

      paragraphs.forEach((p, index) => {
        const text = p.textContent ?? "";
        eventState += text;

        if (index !== paragraphs.length - 1) {
          eventState += "\n";
        }
      });
    }

    data.eventState = eventState;
    const caretInfo = getCaretInfo(target as HTMLElement, event.key);
    data.startPosition = caretInfo?.absolutePosition;
  }

  return data;
}

export const inputHandler = (
  event: Event,
) : Trace => {
  const data = {} as Trace;  
  data.eventType = event.type;

  if (!(event instanceof InputEvent)) return data;

  const target = event.target;
  // data.eventType = event.type;
  data.timestamp = Date.now();
  data.author = "human";

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    data.startPosition = target.selectionStart ?? undefined;
    data.textContent = target.textContent;
    data.eventValue = event.data ?? undefined;
    data.eventState = target.value;
    data.xpath = getXPath(target as Element);
    data.tag = target.tagName;
  }
  else if (target instanceof HTMLElement && target.isContentEditable) {
    let eventState = "";
    const paragraphs = target.querySelectorAll("p, .cm-line, .kix-lineview");
    paragraphs.forEach((p, index) => {
      const text = p.textContent ?? "";
      eventState += text;
      // if (index === paragraphs.length - 2 && event.data === "\n") {
      // } else if (index !== paragraphs.length - 1) {
      //   eventState += "\n";
      // }
      if (index !== paragraphs.length - 1) {
        eventState += "\n";
      }
    });
    data.eventState = eventState;
    data.eventValue = event.data ?? undefined;
    data.xpath = getXPath(target as Element);
    data.tag = target.tagName;
  }
  else {
    data.eventValue = event.data ?? undefined;
    data.xpath = getXPath(target as Element);
    data.tag = (target as Element).tagName;
  }

  // if keydown is Backspace, eventValue is null, eventState is the updated text content
  // if eventState is already empty, there will be no input event fired

  return data;
}

export const changeHandler = (
  event: Event,
) : Trace => {
  const target = event.target;
  const data = {} as Trace;
  data.eventType = event.type;
  data.timestamp = Date.now();

  if (!target || !(target instanceof HTMLElement)) return data;

  data.containerId = getVisibleFormFieldIndex(target);

  if (target instanceof HTMLInputElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.placeholder = target.placeholder;
    data.textContent = target.textContent || "";
    data.clientX = 0;
    data.clientY = 0;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    if (data.elementType === "checkbox" || data.elementType === "radio") {
      data.originValue = target.checked.toString();
      data.valueName = "checked";
    } else if (data.elementType === "file") {
      data.originValue = (target.files?.length || 0).toString();
      data.valueName = "files";
    } else if (data.elementType === "range" || data.elementType === "number") {
      data.originValue = target.valueAsNumber.toString();
      data.valueName = "valueAsNumber";
    } else {
      data.originValue = target.value;
      data.valueName = "value";
    }

    data.valueType = typeof data.originValue;
    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof HTMLTextAreaElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.placeholder = target.placeholder;
    data.textContent = target.textContent || "";
    data.clientX = NaN;
    data.clientY = NaN;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.value;
    data.valueName = "value";
    data.valueType = "string";

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof HTMLSelectElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.textContent = target.textContent || "";

    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.valueName = "value";
    data.originValue = target.value;
    data.valueType = typeof data.originValue;

    data.valueIndex = target.selectedIndex;
    data.valueLabel = target.selectedOptions[0]?.label || "";

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof Element) {
    data.tag = target.tagName;
    data.name = (target as any).name || "";
    data.textContent = target.textContent || "";
    data.clientX = NaN;
    data.clientY = NaN;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);
    data.originValue = "";
    data.valueName = "";
    data.valueType = "";
    data.valueIndex = NaN;
    data.valueLabel = "";
    data.direction = "";
    data.label = target.innerText || "";
  }

  return data;
}

