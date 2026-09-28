import type { Trace } from "@/shared/types";

const MESSAGE_SELECTOR =
  '[data-chatgpt-search-unit-key$=":user"], ' +
  '[data-chatgpt-search-unit-key$=":assistant"]';

export function chatgptMutationHandler(
  node: HTMLElement
): Trace {
  const data = {} as Trace;

  const key =
    node.getAttribute(
      "data-chatgpt-search-unit-key",
    ) || "";

  const messageId =
    node.getAttribute(
      "data-chatgpt-search-message-ids",
    ) || "";

  data.eventType = "mutation";

  data.tag = node.tagName;

  data.author = key.endsWith(":user")
    ? "human"
    : "AI";

  data.message = node.innerText;

  data.sessionId = messageId;

  data.timestamp = Date.now();

  data.name = key;

  return data;
}

export function createChatGPTMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {
  let target: HTMLElement | null = null;
  let innerTextCache: string | null = null;

  const func = (node: HTMLElement) => {
    if (
      target === node &&
      innerTextCache === node.innerText
    ) {
      return;
    }

    emit(node);

    target = node;
    innerTextCache = node.innerText;
  };

  return (
    mutationList: MutationRecord[],
    _observer: MutationObserver
  ) => {
    for (const mutation of mutationList) {
      if (mutation.type === "characterData") {
        const textNode = mutation.target;
        const node = textNode.parentElement;

        if (!node) {
          continue;
        }

        const messageContainer =
          node.closest<HTMLElement>(
            MESSAGE_SELECTOR,
          );

        if (messageContainer) {
          func(messageContainer);
        }
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.matches(MESSAGE_SELECTOR)) {
            func(node);
            return;
          }

          const messageContainers =
            node.querySelectorAll<HTMLElement>(
              MESSAGE_SELECTOR,
            );

          messageContainers.forEach(
            messageContainer => {
              func(messageContainer);
            },
          );
        });
      }
    }
  }
};