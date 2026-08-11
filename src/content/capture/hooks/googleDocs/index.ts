import {
  copyHandler,
  cutHandler,
  pasteHandler,
} from "../../handlers/clipboard";
import { ListenerGroup } from "../../listener/ListenerGroup";
import { listen } from "../../listener/listen";

import {
  disableXHR,
  enableXHR,
  loadInjectedScript,
} from "./injectedController";
import { createGoogleDocsMessageListener } from "./listener";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";
import type { Dispose } from "../../types";
import type { XHRHookConfig } from "./controllerType";

export function mountGoogleDocsEditor(
  emit: (trace: UserEvent) => void,
): Dispose {
  let currentIframe: HTMLIFrameElement | null = null;
  let currentEditor: HTMLElement | null = null;

  let iframeObserver: MutationObserver | null = null;
  let editorDispose: Dispose = () => {};

  function bindEditor(editor: HTMLElement) {
    if (editor === currentEditor) {
      return;
    }

    editorDispose();

    currentEditor = editor;

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

    editorDispose = () => {
      group.dispose();

      if (currentEditor === editor) {
        currentEditor = null;
      }
    };

    console.log("Google Docs editor attached");
  }

  function observeIframe(
    iframe: HTMLIFrameElement,
  ): boolean {
    const doc = iframe.contentDocument;

    if (!doc?.body) {
      return false;
    }

    const findEditor = () =>
      doc.querySelector(
        '[contenteditable="true"]',
      ) as HTMLElement | null;

    const editor = findEditor();

    if (editor) {
      bindEditor(editor);
    }

    iframeObserver = new MutationObserver(() => {
      const editor = findEditor();

      if (editor) {
        bindEditor(editor);
      }
    });

    iframeObserver.observe(doc.body, {
      childList: true,
      subtree: true,
    });

    return true;
  }

  function refreshIframe() {
    const iframe = document.querySelector(
      "iframe.docs-texteventtarget-iframe",
    ) as HTMLIFrameElement | null;

    if (iframe === currentIframe) {
      return;
    }

    iframeObserver?.disconnect();
    iframeObserver = null;

    editorDispose();
    editorDispose = () => {};

    currentIframe = null;

    if (iframe && observeIframe(iframe)) {
      currentIframe = iframe;
    }
  }

  refreshIframe();

  const rootObserver =
    new MutationObserver(refreshIframe);

  rootObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    rootObserver.disconnect();

    iframeObserver?.disconnect();
    iframeObserver = null;

    editorDispose();

    currentIframe = null;
    currentEditor = null;
  };
}

export function mountGoogleDocsXHR(
  config: XHRHookConfig,
  emit: (trace: GoogleDocsMeta) => void,
): Dispose {
  const onLoad = () => enableXHR(config);

  loadInjectedScript(onLoad);

  const handler =
    createGoogleDocsMessageListener(emit);

  window.addEventListener("message", handler);

  return () => {
    disableXHR();
    window.removeEventListener("message", handler);
  };
}
