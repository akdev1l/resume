// The Tetris demo: libtetris compiled to WebAssembly, drawn like the SFML
// front-end draws it. wasm/ holds the tetris repo's `cmake --preset wasm`
// output (build/wasm/wasm/tetris.{mjs,wasm,d.ts}, the .d.ts renamed .d.mts);
// Vite bundles the module and emits the .wasm next to it.
import type { Action, Game, MainModule } from "./wasm/tetris.mjs";

export type { Game, MainModule };

let loading: Promise<MainModule> | undefined;

// Loads the module once; later calls share it.
export function loadTetris(): Promise<MainModule> {
  loading ??= import("./wasm/tetris.mjs").then((module) => module.default());
  return loading;
}

export function newGame(tetris: MainModule): Game {
  return new tetris.Game(crypto.getRandomValues(new Uint32Array(1))[0]);
}

// Same bindings as tetris-gui.
export function actionForKey(tetris: MainModule, key: string): Action | undefined {
  const { Action } = tetris;
  switch (key) {
    case "ArrowLeft":
      return Action.MoveLeft;
    case "ArrowRight":
      return Action.MoveRight;
    case "ArrowUp":
    case "x":
    case "X":
      return Action.RotateClockwise;
    case "z":
    case "Z":
      return Action.RotateCounterClockwise;
    case "ArrowDown":
      return Action.SoftDrop;
    case " ":
      return Action.HardDrop;
    default:
      return undefined;
  }
}

// The frame is the desktop window: the board plus a panel for the next piece.
export const PANEL_COLUMNS = 6;
const PREVIEW_ORIGIN = { x: 1, y: 1 }; // in the panel, like tetris-gui

// tetris-gui's colours, indexed by cell value (0 is an empty square).
const COLORS = [
  "rgb(30, 30, 30)",
  "rgb(0, 240, 240)", // I
  "rgb(240, 240, 0)", // O
  "rgb(160, 0, 240)", // T
  "rgb(0, 240, 0)", // S
  "rgb(240, 0, 0)", // Z
  "rgb(0, 0, 240)", // J
  "rgb(240, 160, 0)", // L
];
const GHOST_ALPHA = 70 / 255;

export function drawGame(ctx: CanvasRenderingContext2D, game: Game, square: number) {
  const width = game.width;
  const height = game.height;

  const fill = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * square, y * square, square - 1, square - 1);
  };
  const piece = (cells: Int32Array, color: string, dx = 0, dy = 0) => {
    for (let i = 0; i < cells.length; i += 2) {
      if (cells[i + 1] + dy >= 0) {
        fill(cells[i] + dx, cells[i + 1] + dy, color);
      }
    }
  };

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, (width + PANEL_COLUMNS) * square, height * square);

  const board = game.board() as Uint8Array;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      fill(x, y, COLORS[board[y * width + x]]);
    }
  }

  piece(game.nextCells() as Int32Array, COLORS[game.nextShape], width + PREVIEW_ORIGIN.x, PREVIEW_ORIGIN.y);

  if (game.over) {
    return;
  }
  const color = COLORS[game.currentShape];
  ctx.globalAlpha = GHOST_ALPHA;
  piece(game.ghostCells() as Int32Array, color);
  ctx.globalAlpha = 1;
  piece(game.currentCells() as Int32Array, color);
}
