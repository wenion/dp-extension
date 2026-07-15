import { getXPath } from "../utils/xpath";

import type { Trace } from "@/shared/types";

export const pointerDownHandler = (
  event: PointerEvent,
  // func?: (trace: UserEventTrace) => void
) : Trace => {
  const target = event.target;
  const data = {} as Trace;
  data.eventType = event.type;
  data.timestamp = Date.now();

  if (!target || !(target instanceof Element)) return data;

  if (target instanceof HTMLInputElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.placeholder = target.placeholder;
    data.textContent = target.textContent || "";
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    let originValue: string | number | boolean = target.value;
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
    // else if (subType === "button" || subType === "submit" || subType === "reset") {
    //   originValue = target.value;

    // } else if (subType === "date" || subType === "time" || subType === "datetime-local" || subType === "month" || subType === "week") {
    //   originValue = target.value;

    // }
    data.valueType = typeof originValue;
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
    data.clientX = event.clientX;
    data.clientY = event.clientY;
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
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.value;;
    data.valueName = "value";
    data.valueType = typeof data.originValue;

    data.valueIndex = target.selectedIndex;
    data.valueLabel = target.selectedOptions[0]?.label || "";

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof HTMLButtonElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.textContent = target.textContent || "";
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.value;
    data.valueName = "value";
    data.valueType = typeof data.originValue;

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof HTMLAnchorElement) {
    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = "";
    data.textContent = target.textContent || "";
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.href;
    data.valueName = "href";
    data.valueType = typeof data.originValue;

    data.label = target.innerText || "";
  }
  else if (target instanceof HTMLDivElement) {
    data.tag = target.tagName;

    data.name = (target as any).name || "";
    data.textContent = target.textContent || "";
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);
    data.originValue = "";
    data.valueName = "";
    data.valueType = "";
    data.label = target.innerText || "";
  }
  else if (target instanceof Element) {
    data.tag = target.tagName;

    data.name = (target as any).name || "";
    data.textContent = target.textContent || "";
    data.clientX = event.clientX;
    data.clientY = event.clientY;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);
    data.originValue = "";
    data.valueName = "";
    data.valueType = "";
    data.label = "";
  }

  return data;
};


export const selectHandler = (
  event: Event,
) : Trace => {
  const data = {} as Trace;
  const target = event.target;

  data.eventType = event.type;
  data.timestamp = Date.now();

  if (!target || !(target instanceof Element)) return data;

  if (target instanceof HTMLInputElement ) {
    if (target.selectionStart === null || target.selectionEnd === null) return data;

    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.placeholder = target.placeholder;
    data.textContent = target.textContent || "";
    data.clientX = target.selectionStart;
    data.clientY = target.selectionEnd;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.value.substring(target.selectionStart, target.selectionEnd);
    data.valueName = "value";
    data.valueType = "string";
    data.direction = target.selectionDirection || "";

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  else if (target instanceof HTMLTextAreaElement) {
    if (target.selectionStart === null || target.selectionEnd === null) return data;

    data.tag = target.tagName;
    data.elementType = target.type;
    data.name = target.name;
    data.placeholder = target.placeholder;
    data.textContent = target.textContent || "";
    data.clientX = target.selectionStart;
    data.clientY = target.selectionEnd;
    data.width = window.innerWidth;
    data.height = window.innerHeight;
    data.xpath = getXPath(target);

    data.originValue = target.value.substring(target.selectionStart, target.selectionEnd);
    data.valueName = "value";
    data.valueType = "string";
    data.direction = target.selectionDirection || "";

    if (target.labels?.length) {
      data.label = Array.from(target.labels).map(l => l.textContent).join(" | ");
    }
  }
  
  return data;
};

export const mouseUpHandler = (
  event: MouseEvent,
) : Trace => {
  const data = {} as Trace;
  data.eventType = event.type;

  const target = event.target;
  if (!target || !(target instanceof Element)) return data;

  const selection = document.getSelection();
  if (!selection) return data;

  if ("type" in target && typeof (target as any).type === "string") {
    data.elementType = (target as any).type;
  }
  data.tag = target.tagName;
  data.name = (target as any).name || "";
  data.textContent = target.textContent || "";
  data.clientX = event.clientX;
  data.clientY = event.clientY;
  data.width = window.innerWidth;
  data.height = window.innerHeight;
  data.xpath = getXPath(target);
  data.timestamp = Date.now();

  data.originValue = selection.toString();
  data.valueName = "";
  data.valueType = "string";
  data.label = "";
  data.direction = selection.direction || "";

  return data;
};

