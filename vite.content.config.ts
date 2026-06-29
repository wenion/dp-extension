import { defineConfig, mergeConfig } from 'vite';
import { common } from "./vite.common";
import path from "path";

// https://vite.dev/config/
export default mergeConfig(common, defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,

    lib: {
      entry: path.resolve(__dirname, "src/content/index.ts"),
      formats: ["iife"],
      name: "ContentScript",
      fileName: () => "content-script.js",
    },

    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith(".css")) {
            return "content-script.css";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
}));
