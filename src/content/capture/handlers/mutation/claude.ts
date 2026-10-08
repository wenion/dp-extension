import type { Trace } from "@/shared/types";

export const CLAUDE_SELECTORS = {
  human: '[data-testid="user-message"]',
  ai: '.font-claude-response',

  messageContainer: '[data-testid="transcript-row"]',
  article: '[role="article"][aria-posinset]',

  message: [
    '[data-testid="user-message"]',
    '.font-claude-response',
  ].join(", "),
} as const;

export function claudeMutationHandler(
  node: HTMLElement
): Trace {
  const data = {} as Trace;

  data.eventType = "mutation";
  data.tag = node.tagName;
  data.message = node.innerText;
  data.timestamp = Date.now();

  data.author = node.closest(
    CLAUDE_SELECTORS.human
  )
    ? "human"
    : node.closest(CLAUDE_SELECTORS.ai)
      ? "AI"
      : "unknown";

  const container = node.closest<HTMLElement>(
    CLAUDE_SELECTORS.messageContainer
  );

  const article = node.closest<HTMLElement>(
    CLAUDE_SELECTORS.article
  );

  data.messageId =
    container?.getAttribute("data-index") ??
    article?.getAttribute("aria-posinset") ??
    undefined;

  data.eventId =
    article?.getAttribute("aria-label") ??
    undefined;

  return data;
}

export function createClaudeMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {
  const textCache = new WeakMap<HTMLElement, string>();

  const findMessages = (
    node: Node
  ): HTMLElement[] => {
    const el =
      node instanceof HTMLElement
        ? node
        : node.parentElement;

    if (!el) return [];

    const closest = el.closest<HTMLElement>(
      CLAUDE_SELECTORS.message
    );

    if (closest) {
      return [closest];
    }

    return Array.from(
      el.querySelectorAll<HTMLElement>(
        CLAUDE_SELECTORS.message
      )
    );
  };

  const process = (node: Node) => {
    const elements = findMessages(node);

    for (const el of elements) {
      const text = el.innerText;

      if (textCache.get(el) === text) {
        continue;
      }

      textCache.set(el, text);
      emit(el);
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

        mutation.addedNodes.forEach(process);
      }
    }
  };
}
