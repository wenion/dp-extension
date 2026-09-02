import { render, unmount } from "./render";
import {
  createContainer,
  createHost,
  createShadowRoot,
  injectStyle,
  removeHost,
} from "./dom";

import type { OverlayState } from "../types";

export class Overlay {
  private host: HTMLDivElement | null = null;

  show(initialState?: OverlayState) {
    if (this.isVisible()) {
      return;
    }

    this.host = createHost();

    const shadowRoot =
      createShadowRoot(this.host);

    injectStyle(shadowRoot);

    const container =
      createContainer(shadowRoot);

    render(container, initialState);
  }

  hide() {
    if (!this.isVisible()) {
      return;
    }

    unmount();
    removeHost(this.host);

    this.host = null;
  }

  isVisible(): boolean {
    return this.host !== null;
  }
}
