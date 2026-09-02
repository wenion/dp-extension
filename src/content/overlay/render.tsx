import ReactDOM from "react-dom/client";

import { Providers } from "../context/providers";
import App from "./App";

import type { Root } from "react-dom/client";
import type { OverlayState } from "../types";

let reactRoot: Root | null = null;

export function render(
  container: HTMLElement,
  initialState?: OverlayState,
) {
  if (reactRoot) {
    return;
  }

  reactRoot =
    ReactDOM.createRoot(container);
  
  reactRoot.render(
    <Providers initialState={initialState}>
      <App />
    </Providers>
  );
}

export function unmount() {
  reactRoot?.unmount();
  reactRoot = null;
}