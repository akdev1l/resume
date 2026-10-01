import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SECTIONS } from "../../core/sections";
import { renderAt, resume } from "../../test/fixtures";
import { ResumePage } from "./ResumePage";

// talks to GitHub; it has its own tests
vi.mock("../components/GitHubActivity", () => ({
  GitHubActivity: ({ user }: { user: string }) => <p>activity of {user}</p>,
}));

const section = (id: string) => document.getElementById(id)!;

describe("ResumePage", () => {
  beforeEach(() => {
    // jsdom has no layout, so no scrolling either
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders every section with its heading, in order", () => {
    renderAt(<ResumePage resume={resume} />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(SECTIONS.map((s) => s.title));
    expect(document.title).toBe("Ada Lovelace - Resume");
  });

  it("introduces with the about paragraphs and the GitHub activity", () => {
    renderAt(<ResumePage resume={resume} />);
    expect(within(section("about")).getByText("First paragraph about Ada.")).toBeInTheDocument();
    expect(within(section("about")).getByText("activity of ada")).toBeInTheDocument();
  });

  it("lists experience, education and projects as entries", () => {
    renderAt(<ResumePage resume={resume} />);

    const job = within(section("experience"));
    expect(job.getByRole("heading", { name: "Translator" })).toBeInTheDocument();
    expect(job.getByRole("link", { name: "Scientific Memoirs" })).toBeInTheDocument();
    expect(job.getAllByRole("listitem")).toHaveLength(2);

    expect(within(section("education")).getByRole("link", { name: "Tutoring" })).toBeInTheDocument();
    expect(within(section("projects")).getByText("Analytical Engine")).toBeInTheDocument();
  });

  it("shows demos as cards and technologies and projects as tiles", () => {
    renderAt(<ResumePage resume={resume} />);

    expect(within(section("demos")).getAllByRole("button", { name: "Try the demo" })).toHaveLength(resume.demos.length);
    expect(within(section("open-source")).getByRole("link", { name: /Engine/ })).toBeInTheDocument();
    const skills = within(section("skills"));
    expect(skills.getByRole("link", { name: /Python/ })).toBeInTheDocument();
    expect(skills.getByRole("link", { name: /AWS/ })).toBeInTheDocument();
    expect(skills.getByRole("link", { name: /Qt/ })).toBeInTheDocument();
    expect(skills.getByRole("img", { name: "Skill chart" })).toBeInTheDocument();
  });

  it("lists the spoken languages with their level", () => {
    renderAt(<ResumePage resume={resume} />);
    const items = within(section("languages")).getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.trim())).toEqual(["English (Native)", "Spanish (Fluent)"]);
  });

  it("scrolls to the section in the address", () => {
    renderAt(<ResumePage resume={resume} />, "/#skills");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(section("skills"));
  });
});
