// ESLint flat config: run with `pnpm lint`.
//
// typescript-eslint needs TypeScript's JS API, which TypeScript 7 (the Go
// port) no longer ships; that is why typescript is pinned to ~6.0.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // build and coverage output, the vendored Emscripten build of libtetris, and
  // the demos' static builds
  globalIgnores(["dist", "coverage", "src/core/wasm", "public/demos"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      // type-aware rules: unhandled promises, unsafe `any`, ...
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      // keeps components hot-reloadable in the dev server
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // tests hand mocked methods to expect(), which this rule can't tell apart
  // from passing a method around unbound
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: { "@typescript-eslint/unbound-method": "off" },
  },

  // the Vite config runs in Node, not the browser
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: globals.node },
  },

  // this file: plain JS, outside the TypeScript project
  {
    files: ["eslint.config.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
]);
