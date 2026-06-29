import { defineConfig, mergeConfig } from "vite";
import { common } from "./vite.common";

export default defineConfig(({ mode }) =>
  mergeConfig(
    common,
    defineConfig({
      root: ".",
      appType: "mpa",
      server: {
        port: 5173,
        open:
          mode === "options"
            ? "/playground/options.html"
            : "/playground/content.html",
      },
    })
  )
);