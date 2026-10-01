import { describe, expect, it } from "vitest";

import { actionForKey, drawGame, type Game, type MainModule } from "./tetris";

const Action = {
  MoveLeft: { value: 0 },
  MoveRight: { value: 1 },
  RotateClockwise: { value: 2 },
  RotateCounterClockwise: { value: 3 },
  SoftDrop: { value: 4 },
  HardDrop: { value: 5 },
};
const tetris = { Action } as unknown as MainModule;

describe("actionForKey", () => {
  it.each([
    ["ArrowLeft", Action.MoveLeft],
    ["ArrowRight", Action.MoveRight],
    ["ArrowUp", Action.RotateClockwise],
    ["x", Action.RotateClockwise],
    ["X", Action.RotateClockwise],
    ["z", Action.RotateCounterClockwise],
    ["ArrowDown", Action.SoftDrop],
    [" ", Action.HardDrop],
    ["q", undefined],
  ])("maps %j like the desktop build", (key, action) => {
    expect(actionForKey(tetris, key)).toBe(action);
  });
});

describe("drawGame", () => {
  const cells = (...xy: number[]) => Int32Array.from(xy);

  function setup(over = false) {
    const fills: { x: number; y: number; color: string; alpha: number }[] = [];
    const ctx = {
      fillStyle: "",
      globalAlpha: 1,
      fillRect(x: number, y: number) {
        fills.push({ x, y, color: this.fillStyle, alpha: this.globalAlpha });
      },
    };
    const board = new Uint8Array(4 * 3);
    board[2 * 4 + 1] = 1; // a locked I square at (1, 2)
    const game = {
      width: 4,
      height: 3,
      over,
      board: () => board,
      currentShape: 3,
      nextShape: 2,
      currentCells: () => cells(0, -1, 1, 0, 2, 0, 3, 0),
      ghostCells: () => cells(0, 1, 1, 2, 2, 2, 3, 2),
      nextCells: () => cells(0, 0, 1, 0, 0, 1, 1, 1),
    } as unknown as Game;
    drawGame(ctx as unknown as CanvasRenderingContext2D, game, 10);
    return fills;
  }

  it("draws the board, the next piece, the ghost and the falling piece", () => {
    const fills = setup();
    const at = (x: number, y: number) => fills.filter((f) => f.x === x * 10 && f.y === y * 10);

    // background, 12 board squares, 4 preview, 4 ghost, 3 current (one is above the board)
    expect(fills).toHaveLength(1 + 12 + 4 + 4 + 3);
    expect(at(1, 2).map((f) => f.color)).toContain("rgb(0, 240, 240)");
    // the preview sits in the side panel
    expect(at(4 + 1, 1).at(-1)!.color).toBe("rgb(240, 240, 0)");
    // the ghost is translucent, the falling piece opaque
    expect(fills.filter((f) => f.alpha < 1)).toHaveLength(4);
    expect(at(1, 0).at(-1)).toMatchObject({ color: "rgb(160, 0, 240)", alpha: 1 });
  });

  it("leaves out the falling piece once the game is over", () => {
    expect(setup(true)).toHaveLength(1 + 12 + 4);
  });
});
