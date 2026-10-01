import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAt } from "../../test/fixtures";
import { DemoCard } from "./DemoCard";

describe("DemoCard", () => {
  it("links a demo hosted on this site to its page, plus its source", () => {
    renderAt(
      <DemoCard
        demo={{ id: "engine", name: "Engine demo", description: "Runs Note G.", stack: ["Brass", "Steam"], source: "https://example.com/src" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Engine demo" })).toBeInTheDocument();
    expect(screen.getByText("Brass, Steam")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try the demo" })).toHaveAttribute("href", "/demo/engine");
    expect(screen.getByRole("button", { name: "Source" })).toHaveAttribute("href", "https://example.com/src");
  });

  it("links an external demo to its url", () => {
    renderAt(<DemoCard demo={{ name: "Hosted", description: "Elsewhere.", stack: [], url: "https://demo.example.com" }} />);
    expect(screen.getByRole("button", { name: "Try the demo" })).toHaveAttribute("href", "https://demo.example.com");
    expect(screen.queryByRole("button", { name: "Source" })).not.toBeInTheDocument();
  });

  it("has no buttons when there is nothing to link to", () => {
    renderAt(<DemoCard demo={{ name: "Idea", description: "Not built yet.", stack: [] }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
