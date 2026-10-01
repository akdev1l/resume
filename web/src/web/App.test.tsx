import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse, resume } from "../test/fixtures";
import { App } from "./App";

// the heavier pieces have their own tests
vi.mock("./components/GitHubActivity", () => ({ GitHubActivity: () => <p>activity</p> }));
vi.mock("./pages/ViewerPage", () => ({ ViewerPage: ({ url }: { url: string }) => <p>viewer for {url}</p> }));

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe("App", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
  });

  it("loads /resume.json and shows the resume", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse(resume)));
    vi.stubGlobal("fetch", fetch);

    renderApp("/");
    expect(document.querySelector("main")).toHaveAttribute("aria-busy", "true");

    expect(await screen.findByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Experience" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/resume.json");
  });

  it.each([
    ["/pdf", "viewer for /main.pdf"],
    ["/demo/engine", "Engine demo"],
    ["/somewhere", "There's nothing at this address."],
  ])("routes %s", async (path, text) => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(resume))));
    renderApp(path);
    expect(await screen.findByText(text, { exact: false })).toBeInTheDocument();
  });

  it("points to the pdf when the resume can't be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({}, 404))));

    renderApp("/");
    expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "pdf version" })).toHaveAttribute("href", "/main.pdf");
  });
});
