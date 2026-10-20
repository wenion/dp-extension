
import { INTERCEPTOR_TYPE } from "@/shared/interceptor";
import { env } from "@/config/env";

import {
  enableInterceptor,
  disableInterceptor,
} from "../../hooks/interceptorController";
import { loadScript } from "../../hooks/scriptLoader";

import { claudeInterceptorConfig } from "./config";
import { createClaudeFetchHandler } from "./parseFetch";

import type { UserEvent } from "@/shared/types";
import type { Dispose } from "../../types";

export function mountClaudeFetch(
  emit: (trace: UserEvent) => void,
): Dispose {
  let disposed = false;

  const handler = createClaudeFetchHandler(emit);

  window.addEventListener("message", handler);

  loadScript(env.fetchInterceptorScript)
    .then((loaded) => {
      if (!loaded) return;

      if (disposed) {
        disableInterceptor(INTERCEPTOR_TYPE.FETCH);
      } else {
        enableInterceptor(
          INTERCEPTOR_TYPE.FETCH,
          claudeInterceptorConfig,
        );
      }
    });

  return () => {
    disposed = true;
    disableInterceptor(INTERCEPTOR_TYPE.FETCH);
    window.removeEventListener("message", handler);
  };
}
