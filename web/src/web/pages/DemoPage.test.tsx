import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Demo } from "../../core/resume";
import { renderAt, resume } from "../../test/fixtures";
import { DemoPage } from "./DemoPage";

// the game itself has its own tests
vi.mock("../components/TetrisGame", () => ({ TetrisGame: () => <p>tetris game</p> }));
vi.mock("../components/FaceStretchDemo", () => ({ FaceStretchDemo: () => <p>face demo</p> }));
vi.mock("../components/BootSplashDemo", () => ({ BootSplashDemo: () => <p>boot splash demo</p> }));

const renderDemo = (path: string, demos: Demo[] = resume.demos) =>
  renderAt(
    <Routes>
      <Route path="/demo/:id" element={<DemoPage demos={demos} />} />
    </Routes>,
    path,
  );

describe("DemoPage", () => {
  it("shows a demo that isn't wired in yet as a placeholder canvas", () => {
    renderDemo("/demo/engine");

    expect(screen.getByRole("heading", { name: "Engine demo" })).toBeInTheDocument();
    expect(screen.getByText("Brass, Steam")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Render output" })).toBeInTheDocument();
    expect(screen.getByText(/isn't wired in yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute("href", "https://example.com/src");
    expect(screen.getByRole("link", { name: "← All demos" })).toHaveAttribute("href", "/#demos");
    expect(document.title).toBe("Ada Lovelace - Engine demo");
  });

  it("runs Tetris with its controls listed", async () => {
    renderDemo("/demo/tetris", [{ id: "tetris", name: "Tetris", description: "Falling blocks.", stack: ["C++20"] }]);

    expect(await screen.findByText("tetris game")).toBeInTheDocument();
    expect(screen.getByText(/Space hard drop/)).toBeInTheDocument();
  });

  it("embeds the stretchy face demo with its controls listed", async () => {
    renderDemo("/demo/webmface64", [
      { id: "webmface64", name: "Stretchy face", description: "Pull a face.", stack: ["TypeScript"] },
    ]);

    expect(await screen.findByText("face demo")).toBeInTheDocument();
    expect(screen.getByText(/Drag the face to stretch it/)).toBeInTheDocument();
  });

  it("runs the 3D boot splash renderer with its controls listed", async () => {
    renderDemo("/demo/3dboot", [
      { id: "3dboot", name: "3D boot splash", description: "Spins a logo.", stack: ["Rust"] },
    ]);

    expect(await screen.findByText("boot splash demo")).toBeInTheDocument();
    expect(screen.getByText(/Drag to orbit/)).toBeInTheDocument();
  });

  it("says when there is no such demo", () => {
    renderDemo("/demo/nope");

    expect(screen.getByText(/There is no demo called “nope”/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "list of demos" })).toHaveAttribute("href", "/#demos");
    expect(document.title).toBe("Ada Lovelace - Demo not found");
  });
});
