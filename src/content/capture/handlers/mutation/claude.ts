import type { Trace } from "@/shared/types";

export function claudeMutationHandler(
  node: HTMLElement
): Trace {

  const data = {} as Trace;

  data.eventType = "mutation";
  data.url = window.location.href;
  data.tag = node.tagName;
  data.message = node.innerText;
  data.timestamp = Date.now();

  node.matches('[data-testid="user-message"]') ? data.author = "human" :
    node.closest('.font-claude-response') ? data.author = "AI" : data.author = "unknown";

  return data;
}

export function createClaudeMutationListener(
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
      // // streaming text updates
      if (mutation.type === "characterData" || mutation.type === "attributes") {
        const node = mutation.target;

        if (!(node instanceof HTMLElement)) return;

        let el =
            node.matches('[data-testid="user-message"]')
            ? node as HTMLElement
            : node.querySelector('[data-testid="user-message"]') as HTMLElement | null;

        if (!el) {
          el = node.closest('.font-claude-response') as HTMLElement | null;
        }

        if (el) {
          func(el as HTMLElement);
        }
      }

      // new DOM nodes added
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          let el =
            node.matches('[data-testid="user-message"]')
            ? node
            : node.querySelector('[data-testid="user-message"]');

          if (el) {
            func(el as HTMLElement);
          }
          else {
            const el = node.closest('.font-claude-response');
            if (el) {
              func(el as HTMLElement);
            }
          }
        });
      }
    }
  };
};