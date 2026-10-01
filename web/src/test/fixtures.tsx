// Shared test data and render helpers. The resume here is a small, fixed
// sample rather than the real resume.json, so editing the content never
// breaks a test.
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";

import type { Resume } from "../core/resume";
import { SiteNameContext } from "../web/layout/site-name";

export const resume: Resume = {
  meta: { title: "Ada Lovelace - Resume", author: "Ada Lovelace", subject: "Resume", keywords: ["resume"] },
  name: { first: "Ada", last: "Lovelace" },
  headline: "",
  avatar: "/avatar.webp",
  about: ["First paragraph about Ada.", "Second paragraph."],
  contact: {
    location: { text: "London, UK", url: "https://maps.example/london" },
    github: { text: "github.com/ada", url: "https://github.com/ada" },
    email: "ada@example.com",
    phone: { text: "+44 20 0000 0000", number: "+442000000000" },
  },
  programmingLanguages: [
    { name: "Python", url: "https://www.python.org", logo: "python", description: "Scripting language." },
    { name: "Analytical Notation", description: "No logo, no link." },
  ],
  humanLanguages: [
    { name: "English", level: "Native", flag: "gb" },
    { name: "Spanish", level: "Fluent", flag: "es" },
  ],
  openSource: [
    { name: "Engine", url: "https://example.com/engine", logo: "/logos/engine.webp", description: "Fixed the mill." },
  ],
  tech: [{ name: "AWS", url: "https://aws.amazon.com", description: "Cloud platform." }],
  frameworks: [{ name: "Qt", url: "https://www.qt.io", logo: "qt", description: "UI framework." }],
  stats: [
    { label: "Maths", value: 1 },
    { label: "Poetry", value: 0.5 },
    { label: "Engines", value: 0.75 },
  ],
  experience: [
    {
      dates: "1842 - 1843",
      title: "Translator",
      org: { name: "Scientific Memoirs", url: "https://example.com/memoirs" },
      highlights: ["Translated Menabrea's paper.", "Wrote the notes, including Note G."],
    },
  ],
  education: [{ date: "1833", title: "Tutoring", url: "https://example.com/tutoring", org: { name: "De Morgan" } }],
  projects: [
    { date: "1843", name: "Note G", url: "https://example.com/note-g", stack: ["Analytical Engine"], description: "An algorithm." },
  ],
  demos: [
    { id: "engine", name: "Engine demo", description: "Runs Note G.", stack: ["Brass", "Steam"], source: "https://example.com/src" },
    { name: "Hosted demo", description: "Lives elsewhere.", stack: ["Web"], url: "https://demo.example.com" },
  ],
};

// Renders inside a router at `path` (default "/"), with the site name set the
// way the Layout does it.
export function renderAt(ui: ReactElement, path = "/", name = "Ada Lovelace") {
  return render(
    <SiteNameContext value={name}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </SiteNameContext>,
  );
}

// A JSON response, for tests that stub fetch.
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
