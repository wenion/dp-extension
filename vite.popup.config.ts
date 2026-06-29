import { defineConfig, mergeConfig } from 'vite';
import { common } from "./vite.common";
import path from "path";

// https://vite.dev/config/
export default mergeConfig(common, defineConfig({
  build: {
    outDir: "dist",

    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "popup.html"),
      },
    },
  },
}));
