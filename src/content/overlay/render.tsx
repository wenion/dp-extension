import ReactDOM from "react-dom/client";

import { Providers } from "../context/providers";
import App from "./App";

import type { Root } from "react-dom/client";
import type { AppState } from "@/shared/types";

let reactRoot: Root | null = null;

export function render(
  container: HTMLElement,
  initialState: AppState,
) {
  if (reactRoot) {
    return;
  }

  reactRoot = ReactDOM.createRoot(container);
  
  reactRoot.render(
    <Providers initialState={initialState}>
      <div className="fixed bottom-6 right-6 pointer-events-auto">
        <App />
      </div>
    </Providers>
  );
}

export function unmount() {
  reactRoot?.unmount();
  reactRoot = null;
}