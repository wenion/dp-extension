import { defineConfig, mergeConfig } from 'vite';
import { common } from "./vite.common";
import path from "path";

// https://vite.dev/config/
export default mergeConfig(common, defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,

    rollupOptions: {
      input: {
        options: path.resolve(__dirname, "options.html"),
      },
    },
  },
}));
