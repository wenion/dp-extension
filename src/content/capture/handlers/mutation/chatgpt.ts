import type { Trace } from "@/shared/types";


export function chatgptMutationHandler(
  node: HTMLElement
): Trace {

  const data = {} as Trace;
  data.eventType = "mutation";
  data.url = window.location.href;
  data.tag = node.tagName;
  data.author = node.getAttribute("data-turn") === "user" ? "human" : "AI";
  data.message = node.innerText;
  data.sessionId = node.getAttribute("data-testid") || "";
  data.timestamp = Date.now();
  data.name = node.getAttribute("data-turn-id") || "";

  return data;
}

export function createChatGPTMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {

  let target: HTMLElement | null = null;
  let innerTextCache: string | null = null;

  const func = (node: HTMLElement) => {
    if (target === node && innerTextCache === node.innerText) {
      return;
    }

    emit(node);
    target = node;
    innerTextCache = node.innerText;
  };

  return (mutationList: MutationRecord[], observer: MutationObserver) => {
    for (const mutation of mutationList) {
      if (mutation.type === "characterData") {
        const textNode = mutation.target;
        const node = textNode.parentElement;

        if (!node) continue;

        const article = node.closest('[data-turn-id]') as HTMLElement | null;
        if (article) {
          func(article);
        }
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches('[data-turn-id]')) {
            func(node);
          }
          else {
            let els = node.querySelectorAll('[data-turn-id]');
            els.forEach((el) => {
              func(el as HTMLElement);
            });
          }
        });
      }
    }
  }
};