import {
  MESSAGE_SOURCE,
  XHR_COMMAND,
} from "./controllerType";

import type { XHRHookConfig } from "./controllerType";

export const attachXHR = (config?: XHRHookConfig) => {
  window.postMessage(
    {
      source: MESSAGE_SOURCE.CONTENT,
      command: XHR_COMMAND.ENABLE,
      config,
    },
    window.location.origin
  );
}

export const detachXHR = () => {
  window.postMessage(
    {
      source: MESSAGE_SOURCE.CONTENT,
      command: XHR_COMMAND.DISABLE,
    },
    window.location.origin
  );
}
