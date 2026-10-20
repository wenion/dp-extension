
import {
  MESSAGE_SENDER,
  INTERCEPTOR_TYPE,
  INTERCEPTOR_COMMAND,
} from "@/shared/interceptor";

import type { InterceptorConfig } from "@/shared/interceptor";

(() => {
  "use strict";

  let originalOpen: typeof XMLHttpRequest.prototype.open | null = null;
  let originalSend: typeof XMLHttpRequest.prototype.send | null = null;

  const requestMetadata = new WeakMap<
    XMLHttpRequest,
    {
      method: string;
      url: string | URL;
      matched: boolean;
    }
  >();

  function handleControlMessage(event: MessageEvent) {
    if (event.source !== window) return;

    const msg = event.data;

    if (
      msg?.sender !== MESSAGE_SENDER.CONTENT ||
      msg.interceptor !== INTERCEPTOR_TYPE.XHR
    ) return;

    if (msg.command === INTERCEPTOR_COMMAND.ENABLE) {
      attachXHRInterceptor(msg.config);
    }

    if (msg.command === INTERCEPTOR_COMMAND.DISABLE) {
      destroy();
    }
  }

  function destroy() {
    detachXHRInterceptor();
    window.removeEventListener("message", handleControlMessage);
  }

  function attachXHRInterceptor(config?: InterceptorConfig) {
    if (originalOpen) return;

    const nativeOpen = XMLHttpRequest.prototype.open;
    const nativeSend = XMLHttpRequest.prototype.send;

    originalOpen = nativeOpen;
    originalSend = nativeSend;

    const matchesRequest = (method: string) => {
      if (!config?.methods) return true;
      return config.methods.includes(method.toUpperCase());
    };

    const forwardOpen = nativeOpen as (
      this: XMLHttpRequest,
      ...args: unknown[]
    ) => void;

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
    ): void {
      requestMetadata.set(this, {
        method,
        url,
        matched: matchesRequest(method),
      });

      forwardOpen.apply(this, Array.from(arguments));
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ): void {
      nativeSend.call(this, body);

      const metadata = requestMetadata.get(this);

      if (metadata?.matched) {
        try {
          window.postMessage(
            {
              sender: MESSAGE_SENDER.INJECTED,
              interceptor: INTERCEPTOR_TYPE.XHR,
              meta: {
                method: metadata.method,
                url: metadata.url,
              },
              body,
            },
            window.location.origin,
          );
        } catch (error) {
          console.warn("[TRACE] XHR capture failed:", error);
        }
      }
    };
  }

  function detachXHRInterceptor() {
    if (!originalOpen || !originalSend) return;

    XMLHttpRequest.prototype.open = originalOpen;
    XMLHttpRequest.prototype.send = originalSend;

    originalOpen = null;
    originalSend = null;
  }

  window.addEventListener("message", handleControlMessage);
})();
