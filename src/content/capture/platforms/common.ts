import { changeHandler, inputHandler, keyDownHandler } from "../handlers/keyboard";
import { copyHandler, cutHandler, pasteHandler } from "../handlers/clipboard";
import { pointerDownHandler } from "../handlers/pointer";

import { ListenerGroup } from "../listener/ListenerGroup";
import { listen } from "../listener/listen";

import { sendUserTrace } from "../sender";


export function mountCommonListeners() {
  const group = new ListenerGroup();

  group.add(
    listen(
      document,
      "pointerdown",
      e => sendUserTrace(
        pointerDownHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "keydown",
      e => sendUserTrace(
        keyDownHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "change",
      e => sendUserTrace(
        changeHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "input",
      e => sendUserTrace(
        inputHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "copy",
      e => sendUserTrace(
        copyHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "cut",
      e => sendUserTrace(
        cutHandler(e)
      )
    )
  );

  group.add(
    listen(
      document,
      "paste",
      e => sendUserTrace(
        pasteHandler(e)
      )
    )
  );

  return () => group.dispose();
}