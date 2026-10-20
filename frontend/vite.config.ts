/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    include: ["tests/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules", "dist"],
  },
});