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

export const loadScript = (
  scriptPath: string,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(scriptPath);

    script.addEventListener("load", () => {
      script.remove();
      resolve(true);
    }, { once: true });

    script.addEventListener("error", () => {
      script.remove();
      resolve(false);
    }, { once: true });

    (document.head || document.documentElement)
      .appendChild(script);
  });
};
