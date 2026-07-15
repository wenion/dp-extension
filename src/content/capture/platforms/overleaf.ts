import { changeHandler, inputHandler, keyDownHandler } from "../handlers/keyboard";
import { copyHandler, cutHandler, pasteHandler } from "../handlers/clipboard";


import { ListenerGroup } from "../listener/ListenerGroup";
import { listen } from "../listener/listen";
import { observe } from "../listener/observe";
import { sendUserTrace } from "../sender";

import type { Dispose } from "../types";


const observerConfig = {
  childList: true,
  subtree: true,
};

function mountOverleafEditorListeners(editor: HTMLElement): Dispose {
  const group = new ListenerGroup();

  group.add(
    listen(editor, "keydown", e => sendUserTrace(keyDownHandler(e)))
  );

  group.add(
    listen(editor, "input", e => sendUserTrace(inputHandler(e)))
  );

  group.add(
    listen(editor, "copy", e => sendUserTrace(copyHandler(e)))
  );

  group.add(
    listen(editor, "cut", e => sendUserTrace(cutHandler(e)))
  );

  group.add(
    listen(editor, "paste", e => sendUserTrace(pasteHandler(e)))
  );

  return () => group.dispose();
}

export const overleafPlatform = {
  mount(): Dispose {
    const group = new ListenerGroup();

    let mounted = false;

    // common listeners
    group.add(
      observe(
        document.body,
        observerConfig,
        (_, observer) => {
          if (mounted) {
              return;
          }

          const editor = document.querySelector(
            ".cm-content[contenteditable='true']"
          ) as HTMLElement | null;

          if (!editor) {
            return;
          }

          mounted = true;

          group.add(
            mountOverleafEditorListeners(editor)
          );

          observer.disconnect();
        }
      )
    );

    return () => group.dispose();

  }
};