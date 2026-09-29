import type { Trace } from "@/shared/types";

const USER_MESSAGE_SELECTOR =
  '[data-testid="chatOutput"]';

const AI_MESSAGE_SELECTOR =
  '[data-testid="markdown-reply"]';

const MESSAGE_SELECTOR =
  `${USER_MESSAGE_SELECTOR}, ${AI_MESSAGE_SELECTOR}`;

export function copilotMutationHandler(
  node: HTMLElement
): Trace {
  const data = {} as Trace;

  data.eventType = "mutation";

  data.tag = node.tagName;

  data.author = node.matches(USER_MESSAGE_SELECTOR)
    ? "human"
    : "AI";

  data.message = node.innerText;

  // AI messages have data-message-id
  data.sessionId =
    node.getAttribute("data-message-id") || "";

  data.timestamp = Date.now();

  data.name =
    data.author === "human"
      ? "copilot-user"
      : "copilot-ai";

  return data;
}

export function createCopilotMutationListener(
  emit: (node: HTMLElement) => void
): MutationCallback {
  const innerTextCache =
    new WeakMap<HTMLElement, string>();

  const func = (node: HTMLElement) => {
    const text = node.innerText;

    if (innerTextCache.get(node) === text) {
      return;
    }

    innerTextCache.set(node, text);
    emit(node);
  };

  return (
    mutationList: MutationRecord[],
    _observer: MutationObserver
  ) => {
    for (const mutation of mutationList) {
      let target: HTMLElement | null = null;

      if (
        mutation.type === "characterData"
      ) {
        target = mutation.target.parentElement;
      } else if (
        mutation.target instanceof HTMLElement
      ) {
        target = mutation.target;
      }

      if (!target) {
        continue;
      }

      // Text changes, especially AI streaming
      if (mutation.type === "characterData") {
        const messageContainer =
          target.closest<HTMLElement>(
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

        // Important for Copilot streaming:
        // sometimes the added node is inside an
        // existing markdown-reply container.
        const messageContainer =
          target.closest<HTMLElement>(
            MESSAGE_SELECTOR,
          );

        if (messageContainer) {
          func(messageContainer);
        }
      }
    }
  };
}
