import {
  MESSAGE_SOURCE,
  XHR_COMMAND,
} from "./controllerType";

import type { XHRHookConfig } from "./controllerType";

export const enableXHR = (config?: XHRHookConfig) => {
  window.postMessage(
    {
      source: MESSAGE_SOURCE.CONTENT,
      command: XHR_COMMAND.ENABLE,
      config,
    },
    window.location.origin
  );
}

export const disableXHR = () => {
  window.postMessage(
    {
      source: MESSAGE_SOURCE.CONTENT,
      command: XHR_COMMAND.DISABLE,
    },
    window.location.origin
  );
}

export const loadInjectedScript = (
  onLoad?: () => void
) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("injected.js");

  script.addEventListener("load", () => {
    try {
      onLoad?.();
    } finally {
      script.remove();
    }
  });

  script.addEventListener("error", () => {
    script.remove();
  });

  (document.head || document.documentElement).appendChild(script);
}
