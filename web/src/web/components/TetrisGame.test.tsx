import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadTetris, newGame, type Game, type MainModule } from "../../core/tetris";
import { TetrisGame } from "./TetrisGame";

// The WebAssembly module is replaced by a fake: these tests are about the
// component (starting, pausing, game over, controls), not the game rules,
// which libtetris tests itself.
vi.mock("../../core/tetris", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../core/tetris")>()),
  loadTetris: vi.fn(),
  newGame: vi.fn(),
}));

const Action = {
  MoveLeft: { value: 0 },
  MoveRight: { value: 1 },
  RotateClockwise: { value: 2 },
  RotateCounterClockwise: { value: 3 },
  SoftDrop: { value: 4 },
  HardDrop: { value: 5 },
} as const;

const tetris = { Action, Game: class {} } as unknown as MainModule;

// a game that ends on the first hard drop
function fakeGame() {
  const state = { over: false };
  return {
    width: 10,
    height: 20,
    score: 0,
    lines: 0,
    level: 1,
    gravityIntervalMs: 1000,
    get over() {
      return state.over;
    },
    apply: vi.fn((action: unknown) => {
      if (action === Action.HardDrop) {
        state.over = true;
      }
    }),
    tick: vi.fn(),
    delete: vi.fn(),
  } as unknown as Game & { apply: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
}

const press = (key: string) => fireEvent.keyDown(window, { key });

async function renderLoaded() {
  const games: ReturnType<typeof fakeGame>[] = [];
  vi.mocked(newGame).mockImplementation(() => {
    const game = fakeGame();
    games.push(game);
    return game;
  });
  vi.mocked(loadTetris).mockResolvedValue(tetris);

  const view = render(<TetrisGame />);
  await screen.findByRole("button", { name: "Play" });
  return { ...view, games };
}

describe("TetrisGame", () => {
  beforeEach(() => {
    vi.mocked(loadTetris).mockReset();
    vi.mocked(newGame).mockReset();
  });

  it("shows a loading state while the module loads", () => {
    vi.mocked(loadTetris).mockReturnValue(new Promise(() => {}));
    render(<TetrisGame />);
    expect(screen.getByText("Loading the WebAssembly module…")).toHaveAttribute("aria-busy", "true");
  });

  it("ignores the controls until the game starts", async () => {
    const { games } = await renderLoaded();
    press("ArrowLeft");
    expect(games[0].apply).not.toHaveBeenCalled();
  });

  it("starts on Enter and maps keys to actions like the desktop build", async () => {
    const { games } = await renderLoaded();

    press("Enter");
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();

    press("ArrowLeft");
    press("x");
    press("z");
    press("ArrowDown");
    expect(games[0].apply.mock.calls.map(([action]: unknown[]) => action)).toEqual([
      Action.MoveLeft,
      Action.RotateClockwise,
      Action.RotateCounterClockwise,
      Action.SoftDrop,
    ]);
  });

  it("pauses on P and when the window loses focus, and resumes on Enter", async () => {
    await renderLoaded();
    await userEvent.click(screen.getByRole("button", { name: "Play" }));

    press("p");
    expect(screen.getByText("Paused")).toBeInTheDocument();
    press("Enter");
    expect(screen.queryByText("Paused")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("ends the game, then R starts a fresh one and frees the old", async () => {
    const { games } = await renderLoaded();
    press("Enter");

    press(" ");
    expect(screen.getByText("Game over · 0")).toBeInTheDocument();

    press("r");
    expect(screen.queryByText("Game over · 0")).not.toBeInTheDocument();
    expect(games).toHaveLength(2);
    expect(games[0].delete).toHaveBeenCalled();
  });

  it("plays from the touch buttons", async () => {
    const { games } = await renderLoaded();
    press("Enter");

    await userEvent.click(screen.getByRole("button", { name: "Move left" }));
    expect(games[0].apply).toHaveBeenCalledWith(Action.MoveLeft);
  });

  it("frees the game when it goes away", async () => {
    const { games, unmount } = await renderLoaded();
    unmount();
    expect(games[0].delete).toHaveBeenCalled();
  });

  it("explains when the module can't be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(loadTetris).mockRejectedValue(new Error("no wasm"));

    render(<TetrisGame />);
    expect(await screen.findByText("The game couldn't be loaded in this browser.")).toBeInTheDocument();
  });
});
