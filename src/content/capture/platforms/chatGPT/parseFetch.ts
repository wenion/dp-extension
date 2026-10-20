
import {
  MESSAGE_SENDER,
  INTERCEPTOR_TYPE,
} from "@/shared/interceptor";

import type { UserEvent } from "@/shared/types";

type Patch = {
  o?: string;
  p?: string;
  v?: any;
  c?: number;
};

type FetchMessage = {
  sender: string;
  interceptor: string;
  type: string;
  payload: {
    requestId: string;
    eventType?: string;
    data?: any;
  };
};

export function createChatGPTFetchHandler(
  emit: (trace: UserEvent) => void,
) {
  const responses = new Map<string, string>();

  return (event: MessageEvent<FetchMessage>) => {
    if (
      event.source !== window ||
      event.origin !== window.location.origin
    ) return;

    const msg = event.data;

    if (
      msg?.sender !== MESSAGE_SENDER.INJECTED ||
      msg.interceptor !== INTERCEPTOR_TYPE.FETCH
    ) return;

    const { requestId, data } = msg.payload ?? {};
    if (!requestId) return;

    // Query: emit immediately.
    if (
      msg.type === "conversation-event" &&
      data?.type === "input_message"
    ) {
      const message = data.input_message;

      if (message?.author?.role === "user") {
        const content = (message.content?.parts ?? [])
          .filter((part: unknown): part is string =>
            typeof part === "string"
          )
          .join("\n");

        if (content) {
          emit({
            eventType: "user_query",
            author: "User",
            messageId: requestId,
            message: content,
            timestamp: Date.now(),
          });
        }
      }
      return;
    }

    function finish() {
      const content = responses.get(requestId);

      if (content === undefined) return;

      responses.delete(requestId);

      if (content) {
        emit({
          eventType: "ai_response",
          author: "AI",
          messageId: requestId,
          message: content,
          timestamp: Date.now(),
        });
      }
    }

    // The interceptor's [DONE] event is a fallback.
    if (msg.type === "conversation-complete") {
      finish();
      return;
    }

    if (msg.type !== "conversation-event") return;

    // Clean up when the stream finishes.
    if (data?.type === "message_stream_complete") {
      finish();
      return;
    }

    if (msg.payload.eventType !== "delta") return;

    const patches: Patch[] = Array.isArray(data?.v)
      ? data.v
      : [data];

    for (const patch of patches) {
      // Initial assistant final message.
      if (patch.v?.message) {
        const message = patch.v.message;

        if (
          message.author?.role === "assistant" &&
          message.channel === "final"
        ) {
          const content = (message.content?.parts ?? [])
            .filter((part: unknown): part is string =>
              typeof part === "string"
            )
            .join("\n");

          responses.set(requestId, content);
        }
      }

      // Append incremental text.
      if (
        patch.o === "append" &&
        patch.p === "/message/content/parts/0" &&
        typeof patch.v === "string"
      ) {
        const content = responses.get(requestId);

        if (content !== undefined) {
          responses.set(requestId, content + patch.v);
        }
      }

      // Replace existing text.
      if (
        patch.o === "replace" &&
        patch.p === "/message/content/parts/0" &&
        typeof patch.v === "string" &&
        responses.has(requestId)
      ) {
        responses.set(requestId, patch.v);
      }

      // Emit as soon as the assistant response is complete.
      if (
        patch.o === "replace" &&
        patch.p === "/message/end_turn" &&
        patch.v === true
      ) {
        finish();
        return;
      }
    }
  };
}
