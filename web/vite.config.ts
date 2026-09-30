import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// The resume content lives next to main.tex so the pdf and the site share it.
// Deployments copy it to the site root; in dev it is served from the repo.
const resumeData = fileURLToPath(new URL("../src/resume.json", import.meta.url));

const serveResumeData = (): Plugin => ({
  name: "serve-resume-data",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/resume.json", async (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(await readFile(resumeData));
    });
  },
});

export default defineConfig({
  plugins: [react(), serveResumeData()],
  // listen on every interface so the page can be opened from outside the
  // build container
  server: { host: "0.0.0.0" },
  preview: { host: "0.0.0.0" },
});
