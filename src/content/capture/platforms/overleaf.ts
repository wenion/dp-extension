import { sendUserTrace } from "../../message/backgroundClient";
import {
  copyHandler,
  cutHandler,
  pasteHandler,
} from "../handlers/clipboard";
import {
  inputHandler,
  keyDownHandler,
} from "../handlers/keyboard";

import { ListenerGroup } from "../listener/ListenerGroup";
import { listen } from "../listener/listen";
import { observe } from "../listener/observe";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";


const observerConfig: MutationObserverInit = {
  childList: true,
  subtree: true,
};

function mountOverleafEditorListeners(
  editor: HTMLElement,
  overlay?: Overlay,
): Dispose {
  const group = new ListenerGroup();

  group.add(
    listen(
      editor,
      "keydown",
      async e => {
        try {
          await sendUserTrace(
            keyDownHandler(e),
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          overlay?.show({
            notice: `${error.message} Please reload the page.`,
          });
        }
      },
    ),
  );

  group.add(
    listen(
      editor,
      "input",
      async e => {
        try {
          await sendUserTrace(
            inputHandler(e),
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          overlay?.show({
            notice: `${error.message} Please reload the page.`,
          });
        }
      },
    ),
  );

  group.add(
    listen(
      editor,
      "copy",
      async e => {
        try {
          await sendUserTrace(
            copyHandler(e),
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          overlay?.show({
            notice: `${error.message} Please reload the page.`,
          });
        }
      },
    ),
  );

  group.add(
    listen(
      editor,
      "cut",
      async e => {
        try {
          await sendUserTrace(
            cutHandler(e),
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          overlay?.show({
            notice: `${error.message} Please reload the page.`,
          });
        }
      }
    ),
  );

  group.add(
    listen(
      editor,
      "paste",
      async e => {
        try {
          await sendUserTrace(
            pasteHandler(e),
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          overlay?.show({
            notice: `${error.message} Please reload the page.`,
          });
        }
      },
    ),
  );

  return () => group.dispose();
}

export const overleafPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    let mounted = false;

    group.add(
      observe(
        document.body,
        observerConfig,
        (_, observer) => {
          if (mounted) {
            return;
          }

          const editor = document.querySelector(
            ".cm-content[contenteditable='true']",
          ) as HTMLElement | null;

          if (!editor) {
            return;
          }

          mounted = true;

          group.add(
            mountOverleafEditorListeners(
              editor,
              overlay,
            ),
          );

          observer.disconnect();
        },
      ),
    );

    return () => group.dispose();
  },
};