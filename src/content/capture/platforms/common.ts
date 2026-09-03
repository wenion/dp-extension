import { sendUserTrace } from "../../message/backgroundClient";

import {
  copyHandler,
  cutHandler,
  pasteHandler,
} from "../handlers/clipboard";
import {
  changeHandler,
  inputHandler,
  keyDownHandler,
} from "../handlers/keyboard";
import { pointerDownHandler } from "../handlers/pointer";

import { ListenerGroup } from "../listener/ListenerGroup";
import { listen } from "../listener/listen";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";


export function mountCommonListeners(
  overlay?: Overlay,
): Dispose {
  const group = new ListenerGroup();

  group.add(
    listen(
      document,
      "pointerdown",
      async e => {
        try {
          await sendUserTrace(
            pointerDownHandler(e),
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
      document,
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
      document,
      "change",
      async e => {
        try {
          await sendUserTrace(
            changeHandler(e),
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
      document,
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
      document,
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
      document,
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
      },
    ),
  );

  group.add(
    listen(
      document,
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