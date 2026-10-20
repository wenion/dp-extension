
import {
  MESSAGE_SENDER,
  INTERCEPTOR_TYPE,
} from "@/shared/interceptor";

import type { UserEvent } from "@/shared/types";

type FetchTraceMessage = {
  sender: typeof MESSAGE_SENDER.INJECTED;
  interceptor: typeof INTERCEPTOR_TYPE.FETCH;
  type: string;
  payload: {
    requestId: string;
    url?: string;
    body?: string;
    eventType?: string;
    data?: unknown;
  };
  timestamp: number;
};

type ClaudeStreamEvent = {
  type?: string;
  index?: number;
  content_block?: {
    type?: string;
    text?: string;
  };
  delta?: {
    type?: string;
    text?: string;
  };
};

type ResponseState = {
  blocks: Map<number, string>;
  textBlocks: Set<number>;
};

function parseClaudeQuery(body?: string): string | null {
  if (!body) return null;

  try {
    const data: unknown = JSON.parse(body);

    if (
      typeof data === "object" &&
      data !== null &&
      "prompt" in data &&
      typeof data.prompt === "string"
    ) {
      return data.prompt;
    }

    return null;
  } catch {
    return null;
  }
}

export function createClaudeFetchHandler(
  emit: (trace: UserEvent) => void,
) {
  const responses = new Map<string, ResponseState>();

  return (event: MessageEvent<FetchTraceMessage>) => {
    if (
      event.source !== window ||
      event.origin !== window.location.origin
    ) return;

    const msg = event.data;

    if (
      msg?.sender !== MESSAGE_SENDER.INJECTED ||
      msg.interceptor !== INTERCEPTOR_TYPE.FETCH
    ) return;

    const { requestId, body, eventType, data } =
      msg.payload ?? {};

    if (!requestId) return;

    const timestamp = msg.timestamp;

    // Query: emit immediately.
    if (msg.type === "conversation-request") {
      const content = parseClaudeQuery(body);

      if (content) {
        emit({
          eventType: "user_query",
          author: "User",
          messageId: requestId,
          message: content,
          timestamp,
        } as UserEvent);
      }

      return;
    }

    const streamEvent =
      data as ClaudeStreamEvent | undefined;

    const type =
      eventType ?? streamEvent?.type ?? msg.type;

    if (!streamEvent && type !== "message_stop") {
      return;
    }

    const getState = (): ResponseState => {
      let state = responses.get(requestId);

      if (!state) {
        state = {
          blocks: new Map(),
          textBlocks: new Set(),
        };
        responses.set(requestId, state);
      }

      return state;
    };

    switch (type) {
      case "message_start": {
        responses.set(requestId, {
          blocks: new Map(),
          textBlocks: new Set(),
        });
        break;
      }

      case "content_block_start": {
        const index = streamEvent?.index;
        const block = streamEvent?.content_block;

        if (
          index === undefined ||
          block?.type !== "text"
        ) break;

        const state = getState();

        state.textBlocks.add(index);
        state.blocks.set(index, block.text ?? "");
        break;
      }

      case "content_block_delta": {
        const index = streamEvent?.index;
        const delta = streamEvent?.delta;

        if (
          index === undefined ||
          delta?.type !== "text_delta" ||
          typeof delta.text !== "string"
        ) break;

        const state = getState();

        if (!state.textBlocks.has(index)) break;

        const previous = state.blocks.get(index) ?? "";

        state.blocks.set(
          index,
          previous + delta.text,
        );
        break;
      }

      case "message_stop": {
        const state = responses.get(requestId);

        if (!state) break;

        const content = [...state.blocks.entries()]
          .sort(([a], [b]) => a - b)
          .map(([, text]) => text)
          .join("");

        if (content) {
          emit({
            eventType: "ai_response",
            author: "AI",
            messageId: requestId,
            message: content,
            timestamp,
          } as UserEvent);
        }

        responses.delete(requestId);
        break;
      }

      case "error": {
        responses.delete(requestId);
        break;
      }
    }
  };
}
