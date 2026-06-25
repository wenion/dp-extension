import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "./",

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    outDir: "dist",

    rollupOptions: {
      input: {
        popup: path.resolve(
          __dirname,
          "popup.html"
        ),

        background: path.resolve(
          __dirname,
          "src/background/index.ts"
        ),

        "content-script": path.resolve(
          __dirname,
          "src/content/index.ts"
        ),
      },

      output: {
        entryFileNames: "[name].js",

        chunkFileNames: "chunks/[name].js",

        assetFileNames: "[name].[ext]"
      }
    }
  }
})
