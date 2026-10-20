import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(
        __dirname,
        `src/interceptors/xhr-interceptor.ts`
      ),
      name: "XHRInterceptor",
      formats: ["iife"],
      fileName: () => "xhr-interceptor.js",
    },
  },
});
