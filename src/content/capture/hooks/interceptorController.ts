import {
  MESSAGE_SENDER,
  INTERCEPTOR_COMMAND,
  INTERCEPTOR_TYPE,
} from "../../../shared/interceptor";

import type { InterceptorConfig } from "../../../shared/interceptor";

type InterceptorType =
  (typeof INTERCEPTOR_TYPE)[keyof typeof INTERCEPTOR_TYPE];

const sendCommand = (
  interceptor: InterceptorType,
  command: string,
  config?: InterceptorConfig,
) => {
  window.postMessage(
    {
      sender: MESSAGE_SENDER.CONTENT,
      interceptor,
      command,
      config,
    },
    window.location.origin,
  );
};

export const enableInterceptor = (
  interceptor: InterceptorType,
  config?: InterceptorConfig,
) => {
  sendCommand(
    interceptor,
    INTERCEPTOR_COMMAND.ENABLE,
    config,
  );
};

export const disableInterceptor = (
  interceptor: InterceptorType,
) => {
  sendCommand(
    interceptor,
    INTERCEPTOR_COMMAND.DISABLE,
  );
};
