import { getCaretInfo } from "../utils/caret.ts";
import { getXPath } from "../utils/xpath";
import { getVisibleFormFieldIndex } from "../utils/formFieldIndex.ts";

import type { Trace } from "@/shared/types";

export const keyDownHandler = (
  event: KeyboardEvent,
) : Trace => {
  const data = {} as Trace;
  data.eventType = event.type;
  const target = event.target;

  if (!target) {
    data.reason = "NoTarget";
    return data;
  }

  const isNativeInput =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement;

  const isInContentEditable =
    (target as HTMLElement).isContentEditable;

  if (!isNativeInput && !isInContentEditable) {
    data.reason = "UnsupportedEditor";
    return data;
  }

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
  if (isModifierOnly) {
    data.reason = "ModifierKey";
    return data;
  }

  // ignore most shortcuts EXCEPT undo/redo
  if (
    (event.ctrlKey || event.metaKey || event.altKey) &&
    !isUndo &&
    !isRedo
  ) {
    data.reason = "Shortcut"
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
  data.xpath = getXPath(target as Element);

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

    const caretInfo = getCaretInfo(target as HTMLElement, event.key);
    data.startPosition = caretInfo?.absolutePosition;
  }
  else if (target instanceof HTMLElement && target.isContentEditable) {
    const caretInfo = getCaretInfo(target as HTMLElement, event.key);

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
  data.inputType = event.inputType;

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

