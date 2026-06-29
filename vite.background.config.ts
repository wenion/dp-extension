import { defineConfig, mergeConfig } from "vite";
import { common } from "./vite.common";
import path from "path";

export default mergeConfig(common, defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,

    lib: {
      entry: path.resolve(__dirname, "src/background/index.ts"),
      formats: ["iife"],
      name: "Background",
      fileName: () => "background.js",
    },
  },
}));