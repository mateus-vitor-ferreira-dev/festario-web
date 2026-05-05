/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps to Sentry on production builds so stack traces are readable.
    // Runs only when SENTRY_AUTH_TOKEN is present (CI/Vercel), skipped locally.
    sentryVitePlugin({
      org: "recanto-vila-rica",
      project: "javascript-react",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      silent: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
    setupFiles: ["./src/tests/setup.ts"],
    alias: [
      { find: "@react-oauth/google", replacement: path.resolve("./src/tests/mocks/react-oauth-google.ts") },
      { find: "@react-pdf/renderer", replacement: path.resolve("./src/tests/mocks/react-pdf-renderer.tsx") },
      { find: /^react-datepicker\/dist\/.*\.css$/, replacement: path.resolve("./src/tests/mocks/empty.ts") },
      { find: "react-datepicker", replacement: path.resolve("./src/tests/mocks/react-datepicker.tsx") },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/App.tsx",
        "src/main.tsx",
        "src/tests/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.stories.{ts,tsx}",
        "src/styles/**",
        "src/assets/**",
        "src/**/styles.ts",
        "src/docs/**",
        "src/components/IntroAnimation/**",
        "src/components/ContratoRVR/**",
        "src/components/PageLoader/**",
        "src/services/auth.ts",
        "src/services/api.ts",
        "src/components/index.ts",
        "src/pages/index.ts",
      ],
      thresholds: {
        branches: 75,
        functions: 82,
        lines: 84,
      },
    },
  },
});
