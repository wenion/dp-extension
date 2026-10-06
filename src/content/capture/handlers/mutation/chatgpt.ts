import type { Trace } from "@/shared/types";

const MESSAGE_SELECTOR = [
  '[data-chatgpt-search-unit-key$=":user"]',
  '[data-chatgpt-search-unit-key$=":assistant"]',
  '[data-message-role="user"]',
  '[data-message-role="assistant"]',
].join(", ");

export function chatgptMutationHandler(
  node: HTMLElement
): Trace {
  const data = {} as Trace;

  const searchUnitKey =
    node.getAttribute(
      "data-chatgpt-search-unit-key",
    );

  const messageRole =
    node.getAttribute(
      "data-message-role",
    );

  const messageId =
    node.getAttribute(
      "data-chatgpt-search-message-ids",
    ) ??
    node.id;

  data.eventType = "mutation";

  data.tag = node.tagName;

  data.author =
    searchUnitKey?.endsWith(":user") ||
    messageRole === "user"
      ? "human"
      : "AI";

  data.message = node.innerText;

  data.sessionId = messageId;

  data.timestamp = Date.now();

  data.name =
    searchUnitKey ??
    messageRole ??
    "";

  return data;
}

export function createChatGPTMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {
  const innerTextCache =
    new WeakMap<HTMLElement, string>();

  const func = (node: HTMLElement) => {
    const currentText = node.innerText;
    const previousText =
      innerTextCache.get(node);

    if (previousText === currentText) {
      return;
    }

    emit(node);

    innerTextCache.set(
      node,
      currentText,
    );
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
        const target =
          mutation.target instanceof HTMLElement
            ? mutation.target
            : mutation.target.parentElement;

        // Existing message content changed
        const parentMessage =
          target?.closest<HTMLElement>(
            MESSAGE_SELECTOR,
          );

        if (parentMessage) {
          func(parentMessage);
        }

        // A completely new message was added
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.matches(MESSAGE_SELECTOR)) {
            func(node);
            return;
          }

          node
            .querySelectorAll<HTMLElement>(
              MESSAGE_SELECTOR,
            )
            .forEach(func);
        });
      }
    }
  }
};