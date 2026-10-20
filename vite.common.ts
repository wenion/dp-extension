// vite.common.ts

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export const common = {
  envPrefix: ["VITE_", "XHR_INTERCEPTOR_RESOURCES"],

  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
