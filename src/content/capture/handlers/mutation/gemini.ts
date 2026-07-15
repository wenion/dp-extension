import type { Trace } from "@/shared/types";


export function geminiMutationHandler(
  node: HTMLElement
): Trace {
  const data = {} as Trace;

  data.eventType = "mutation";
  data.url = window.location.href;
  data.tag = node.tagName;
  data.message = node.innerText; // don't need to concatenate
  data.timestamp = Date.now();

  if (data.tag === "USER-QUERY") {
    data.author = "human";
    const parent = node.closest('div[class*="conversation-container"]'); //The first <div> element whose class attribute contains the substring "conversation-container"
    data.sessionId = parent ? parent.getAttribute("id") || data.timestamp.toString() :
      data.timestamp.toString();

    const child = node.querySelector('[class*="query-content"]');
    data.name = child ? child.getAttribute("id") || "" : "";

  } else if (data.tag === "MODEL-RESPONSE") {
    data.author = "AI";
    const parent = node.closest('div[class*="conversation-container"]'); //The first <div> element whose class attribute contains the substring "conversation-container"
    data.sessionId = parent ? parent.getAttribute("id") || data.timestamp.toString() :
      data.timestamp.toString();

    const child = node.querySelector('message-content');
    data.name = child ? child.getAttribute("id") || "" : "";
  }

  return data;
}

export function createGeminiMutationListener(
  emit: (node: HTMLElement) => void,
  delay: number = 10000
): MutationCallback {

  let target: HTMLElement | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const func = (node: HTMLElement) => {
    emit(node);
  };

  return (mutationList: MutationRecord[], _observer: MutationObserver) => {
    for (const mutation of mutationList) {
      if (mutation.type === "characterData" || mutation.type === "attributes") {
        if (target && target.contains(mutation.target)) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(func, delay, target);
        }
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            (node.tagName === "USER-QUERY" ||
              node.tagName === "MODEL-RESPONSE")
          ) {
            if (target) {
              func(target);
            }
            target = node;
          }
        });
      }
    }
  }
};