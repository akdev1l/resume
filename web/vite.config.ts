import { copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// The resume content lives next to main.tex so the pdf and the site share it.
// Deployments copy it to the site root; in dev it is served from the repo.
const resumeData = fileURLToPath(new URL("../src/resume.json", import.meta.url));

const serveResumeData = (): Plugin => ({
  name: "serve-resume-data",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/resume.json", (_req, res) => {
      readFile(resumeData).then(
        (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(data);
        },
        (error: unknown) => {
          res.statusCode = 500;
          res.end(`reading ${resumeData} failed: ${String(error)}`);
        },
      );
    });
  },
});

// GitHub Pages can't rewrite /pdf or /demo/tetris to index.html, but it
// serves 404.html for any missing path: as a copy of index.html it boots the
// app, and the router shows the right page.
const spaFallback = (): Plugin => ({
  name: "spa-404-fallback",
  apply: "build",
  async writeBundle(options) {
    const dir = options.dir!;
    await copyFile(join(dir, "index.html"), join(dir, "404.html"));
  },
});

export default defineConfig({
  plugins: [react(), serveResumeData(), spaFallback()],
  // listen on every interface so the page can be opened from outside the
  // build container
  server: { host: "0.0.0.0" },
  preview: { host: "0.0.0.0" },
  // unit tests: `pnpm test`; components render into jsdom
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    // `pnpm test:coverage`: summary in the terminal, browsable report in
    // coverage/index.html, lcov for CI tools
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        // vendored Emscripten build of libtetris
        "src/core/wasm/**",
        // entry point: only wires React to the page
        "src/web/main.tsx",
      ],
      reporter: ["text", "html", "lcov"],
      // the run fails below these: today's coverage rounded down, so it can
      // only go up; raise them as tests are added
      thresholds: {
        statements: 91,
        branches: 85,
        functions: 90,
        lines: 91,
      },
    },
  },
});
