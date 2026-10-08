import type { Trace } from "@/shared/types";

export const CHATGPT_SELECTORS = {
  human: [
    '[data-chatgpt-search-unit-key$=":user"]',
    '[data-message-role="user"]',
  ].join(", "),

  ai: [
    '[data-chatgpt-search-unit-key$=":assistant"]',
    '[data-message-role="assistant"]',
  ].join(", "),

  message: [
    '[data-chatgpt-search-unit-key$=":user"]',
    '[data-chatgpt-search-unit-key$=":assistant"]',
    '[data-message-role="user"]',
    '[data-message-role="assistant"]',
  ].join(", "),
} as const;

function getChatGPTMessageId(
  node: HTMLElement,
): string | undefined {
  const selectionMessageId =
    node.getAttribute(
      "data-chatgpt-selection-message-id",
    ) ??
    node.querySelector<HTMLElement>(
      "[data-chatgpt-selection-message-id]",
    )?.getAttribute(
      "data-chatgpt-selection-message-id",
    );

  const searchMessageIds =
    node.getAttribute(
      "data-chatgpt-search-message-ids",
    );

  return (
    selectionMessageId ||
    searchMessageIds?.trim().split(/\s+/)[0] ||
    undefined
  );
}

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

  data.eventType = "mutation";
  data.tag = node.tagName;
  data.message = node.innerText;
  data.timestamp = Date.now();

  data.author = node.matches(
    CHATGPT_SELECTORS.human,
  )
    ? "human"
    : node.matches(CHATGPT_SELECTORS.ai)
      ? "AI"
      : "unknown";

  data.messageId = getChatGPTMessageId(node);

  data.eventId =
    searchUnitKey ??
    undefined;

  data.name =
    searchUnitKey ??
    messageRole ??
    "";

  return data;
}

export function createChatGPTMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {
  const messageCache =
    new WeakMap<HTMLElement, string>();

  const findMessages = (
    node: Node,
  ): HTMLElement[] => {
    const el =
      node instanceof HTMLElement
        ? node
        : node.parentElement;

    if (!el) return [];

    const messages = new Set<HTMLElement>();

    const closest = el.closest<HTMLElement>(
      CHATGPT_SELECTORS.message,
    );

    if (closest) {
      messages.add(closest);
    }

    if (el.matches(CHATGPT_SELECTORS.message)) {
      messages.add(el);
    }

    el.querySelectorAll<HTMLElement>(
      CHATGPT_SELECTORS.message,
    ).forEach(message => {
      messages.add(message);
    });

    return Array.from(messages);
  };

  const process = (node: Node) => {
    const messages = findMessages(node);

    for (const message of messages) {
      const currentText = message.innerText;

      const currentState = JSON.stringify([
        currentText,
        getChatGPTMessageId(message),
      ]);

      if (
        messageCache.get(message) ===
        currentState
      ) {
        continue;
      }

      messageCache.set(
        message,
        currentState,
      );

      emit(message);
    }
  };

  return (
    mutationList: MutationRecord[],
    _observer: MutationObserver
  ) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "characterData" ||
        mutation.type === "attributes"
      ) {
        process(mutation.target);
      }

      if (mutation.type === "childList") {
        process(mutation.target);

        mutation.addedNodes.forEach(
          process,
        );
      }
    }
  }
};
