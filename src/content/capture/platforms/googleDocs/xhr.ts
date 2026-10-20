import { INTERCEPTOR_TYPE } from "@/shared/interceptor";
import { env } from "@/config/env";

import {
  enableInterceptor,
  disableInterceptor,
} from "../../hooks/interceptorController";
import { loadScript } from "../../hooks/scriptLoader";

import { googleDocsInterceptorConfig } from "./config";
import { createGoogleDocsXHRHandler } from "./parseXHR";

import type { GoogleDocsMeta } from "@/shared/types";
import type { Dispose } from "../../types";

export function mountGoogleDocsXHR(
  emit: (trace: GoogleDocsMeta) => void,
): Dispose {
  let disposed = false;

  const handler =
    createGoogleDocsXHRHandler(emit);

  window.addEventListener("message", handler);

  loadScript(env.xhrInterceptorScript)
    .then((loaded) => {
      if (!loaded) {
        return;
      }

      // Clean up if disposed before the script finished loading.
      if (disposed) {
        disableInterceptor(INTERCEPTOR_TYPE.XHR);
      }
      else {
        enableInterceptor(
          INTERCEPTOR_TYPE.XHR,
          googleDocsInterceptorConfig,
        );
      }
    });

  return () => {
    disposed = true;
    disableInterceptor(INTERCEPTOR_TYPE.XHR);
    window.removeEventListener("message", handler);
  };
}
