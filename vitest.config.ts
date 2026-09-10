import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const sourceDirectory = new URL("./src", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": sourceDirectory,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
