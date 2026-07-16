import "@/styles/globals.css";

import { render, unmount } from "./render";
import {
  createHost,
  injectStyle,
  removeHost,
  removeStyle,
} from "./dom";

import type { InitState } from "@/shared/types";

export class Overlay {
  private host: HTMLDivElement | null = null;
  private style: HTMLLinkElement | null = null;

  show(initialState: InitState) {
    if (this.isVisible()) {
      return;
    }

    this.host = createHost();
    this.style = injectStyle();

    render(this.host, initialState);
  }

  hide() {
    if (!this.isVisible()) {
      return;
    }

    unmount();

    removeHost(this.host);
    removeStyle(this.style);

    this.host = null;
    this.style = null;
  }

  isVisible(): boolean {
    return this.host !== null;
  }
}

export const overlay = new Overlay();
