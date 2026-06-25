// src/popup/main.tsx

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { HeroUIProvider } from "@heroui/system";

import { Providers } from "./components/providers";

import "@/styles/globals.css";

import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <BrowserRouter>
    {/* <HeroUIProvider> */}
      <Providers>
        <App />
      </Providers>
    {/* </HeroUIProvider> */}
  </BrowserRouter>
);