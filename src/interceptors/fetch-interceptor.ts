import {
  MESSAGE_SENDER,
  INTERCEPTOR_TYPE,
  INTERCEPTOR_COMMAND,
} from "@/shared/interceptor";

import type { InterceptorConfig } from "@/shared/interceptor";

(() => {
  "use strict";

  let originalFetch: typeof window.fetch | null = null;
  let wrappedFetch: typeof window.fetch | null = null;
  let active = false;

  const activeReaders = new Set<
    ReadableStreamDefaultReader<Uint8Array>
  >();

  function handleControlMessage(event: MessageEvent) {
    if (
      event.source !== window ||
      event.origin !== window.location.origin
    ) return;

    const msg = event.data;

    if (
      msg?.sender !== MESSAGE_SENDER.CONTENT ||
      msg.interceptor !== INTERCEPTOR_TYPE.FETCH
    ) return;

    if (msg.command === INTERCEPTOR_COMMAND.ENABLE) {
      attachFetchInterceptor(msg.config);
    }

    if (msg.command === INTERCEPTOR_COMMAND.DISABLE) {
      destroy();
    }
  }

  function destroy() {
    detachFetchInterceptor();
    window.removeEventListener("message", handleControlMessage);
  }

  function isTargetRequest(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    config?: InterceptorConfig,
  ): boolean {
    const method = (
      init?.method ?? (input instanceof Request ? input.method : "GET")
    ).toUpperCase();

    if (config?.methods && !config.methods.includes(method)) return false;

    if (config?.urls?.length) {
      const url = input instanceof Request ? input.url : String(input);
      if (!config.urls.some(k => url.includes(k))) return false;
    }

    return true;
  }

  function emit(type: string, payload: unknown) {
    if (!active) return;

    window.postMessage(
      {
        sender: MESSAGE_SENDER.INJECTED,
        interceptor: INTERCEPTOR_TYPE.FETCH,
        type,
        payload,
        timestamp: Date.now(),
      },
      window.location.origin,
    );
  }

  function attachFetchInterceptor(config?: InterceptorConfig) {
    if (originalFetch) return;

    const nativeFetch = window.fetch;

    originalFetch = nativeFetch;
    active = true;

    wrappedFetch = function (
      this: Window,
      ...args: Parameters<typeof fetch>
    ): ReturnType<typeof fetch> {
      const [input, init] = args;

      if (!isTargetRequest(input, init, config)) {
        return Reflect.apply(nativeFetch, this, args);
      }

      const requestId = crypto.randomUUID();

      let requestBodyPromise: Promise<string | null> =
        Promise.resolve(null);

      try {
        if (typeof init?.body === "string") {
          requestBodyPromise = Promise.resolve(init.body);
        } else if (
          init?.body == null &&
          input instanceof Request
        ) {
          requestBodyPromise = input.clone().text();
        }
      } catch (error) {
        console.warn("[TRACE] Request capture failed:", error);
      }

      // Do not delay the original request.
      const responsePromise = Reflect.apply(
        nativeFetch,
        this,
        args,
      ) as ReturnType<typeof fetch>;

      void requestBodyPromise
        .then(body => {
          if (body !== null) {
            emit("conversation-request", {
              requestId,
              body,
            });
          }
        })
        .catch(error => {
          console.warn("[TRACE] Request read failed:", error);
        });

      // Observe a cloned response without replacing
      // the original fetch Promise.
      void responsePromise
        .then(response => {
          if (!active || !response.ok) return;

          const contentType =
            response.headers.get("content-type") ?? "";

          if (!contentType.includes("text/event-stream")) {
            return;
          }

          void captureSSEStream(response.clone(), requestId);
        })
        .catch(error => {
          if (active) {
            console.warn("[TRACE] Response capture failed:", error);
          }
        });

      return responsePromise;
    };

    window.fetch = wrappedFetch;
  }

  async function captureSSEStream(
    response: Response,
    requestId: string,
  ) {
    const reader = response.body?.getReader();
    if (!reader) return;

    activeReaders.add(reader);

    const decoder = new TextDecoder();
    let buffer = "";

    function processEvent(rawEvent: string) {
      const lines = rawEvent.split(/\r\n|\n|\r/);

      const eventType = lines
        .find(line => line.startsWith("event:"))
        ?.slice(6)
        .trim();

      const data = lines
        .filter(line => line.startsWith("data:"))
        .map(line => line.slice(5).trimStart())
        .join("\n");

      if (!data || !active) return;

      if (data === "[DONE]") {
        emit("conversation-complete", { requestId });
        return;
      }

      try {
        emit("conversation-event", {
          requestId,
          eventType,
          data: JSON.parse(data),
        });
      } catch {
        // Ignore non-JSON messages.
      }
    }

    try {
      while (active) {
        const { done, value } = await reader.read();

        if (done || !active) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split(/\r\n\r\n|\n\n|\r\r/);
        buffer = events.pop() ?? "";

        for (const event of events) {
          processEvent(event);
        }
      }

      if (active) {
        buffer += decoder.decode();

        if (buffer.trim()) {
          processEvent(buffer);
        }
      }
    } catch (error) {
      if (active) {
        console.warn("[TRACE] SSE capture failed:", error);
      }
    } finally {
      activeReaders.delete(reader);
      reader.releaseLock();
    }
  }

  function detachFetchInterceptor() {
    if (!originalFetch) return;

    active = false;

    if (window.fetch === wrappedFetch) {
      window.fetch = originalFetch;
    }

    for (const reader of activeReaders) {
      void reader.cancel().catch(() => {});
    }

    activeReaders.clear();

    originalFetch = null;
    wrappedFetch = null;
  }

  window.addEventListener("message", handleControlMessage);
})();
