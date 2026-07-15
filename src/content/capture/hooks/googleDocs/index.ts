import {
  copyHandler,
  cutHandler,
  pasteHandler
} from "../../handlers/clipboard";

import { ListenerGroup } from "../../listener/ListenerGroup";
import { listen } from "../../listener/listen";
import { injectPageScript } from "./inject";
import { attachXHR, detachXHR } from "./controller";
import { createGoogleDocsMessageListener } from "./listener";

import type { GoogleDocsMeta, UserEvent } from "@/shared/types";
import type { XHRHookConfig } from "./controllerType";
import type { Dispose } from "../../types";


export function mountGoogleDocsEditor(
  emit: (trace: UserEvent) => void
): Dispose {

  const iframe = document.querySelector(
    'iframe.docs-texteventtarget-iframe'
  ) as HTMLIFrameElement | null;

  if (!iframe?.contentDocument) {
    console.log("contentDocument fail")
    return () => {};
  }

  const editor = iframe.contentDocument.querySelector(
    '[contenteditable="true"]'
  ) as HTMLElement;

  if (!editor) {
    console.log("editor fail")
    return () => {};
  }

  const group = new ListenerGroup();

  group.add(
    listen(editor, "copy", e => emit(copyHandler(e)))
  );
  group.add(
    listen(editor, "cut", e => emit(cutHandler(e)))
  );
  group.add(
    listen(editor, "paste", e => emit(pasteHandler(e)))
  );

  return () => group.dispose();
}

export function mountGoogleDocsXHR(
  config: XHRHookConfig,
  emit: (trace: GoogleDocsMeta) => void,
): Dispose {
  const onLoad = () => attachXHR(config);

  injectPageScript(onLoad);

  const handler =
    createGoogleDocsMessageListener(emit);

  window.addEventListener("message", handler);

  return () => {
    detachXHR();
    window.removeEventListener("message", handler);
  };

}
