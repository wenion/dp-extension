import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/system";

import { Providers } from "./context/providers";

import "@/styles/globals.css";

import App from "./App";
import Header from "./Header";

export function render(root: HTMLElement) {
  ReactDOM.createRoot(root).render(
    <HeroUIProvider>
      <Providers>
        <Header />
        <App />
      </Providers>
    </HeroUIProvider>
  );
}
