import {
  OverlayController,
} from "./controller";

import type {
  OverlayState,
} from "../types";

let controller:
  OverlayController | undefined;

export function render(
  container: HTMLElement,
  initialState?: OverlayState,
) {
  if (controller) {
    return;
  }

  controller =
    new OverlayController(
      container,
      initialState,
    );
}

export function unmount() {
  controller?.destroy();

  controller = undefined;
}