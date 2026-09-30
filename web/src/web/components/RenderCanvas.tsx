import { useEffect, useRef } from "react";

import "./render-canvas.css";

interface RenderCanvasProps {
  // size in grid squares, e.g. a 10x20 board plus a 6 column side panel
  columns: number;
  rows: number;
  // columns on the left that are the playfield; the rest is drawn as a panel
  fieldColumns?: number;
  label: string;
}

const SQUARE = 24;
const BACKGROUND = "#000000";
const EMPTY_SQUARE = "rgb(30, 30, 30)"; // tetris-gui's colour for empty cells
const LABEL = "rgba(255, 255, 255, 0.6)";

// Placeholder for a demo's render output: an empty grid the size of the real
// frame, drawn like the desktop build draws an empty board.
export function RenderCanvas({ columns, rows, fieldColumns = columns, label }: RenderCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current!;
    const scale = window.devicePixelRatio || 1;
    element.width = columns * SQUARE * scale;
    element.height = rows * SQUARE * scale;

    const ctx = element.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.scale(scale, scale);
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, columns * SQUARE, rows * SQUARE);

    ctx.fillStyle = EMPTY_SQUARE;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < fieldColumns; x++) {
        ctx.fillRect(x * SQUARE, y * SQUARE, SQUARE - 1, SQUARE - 1);
      }
    }

    ctx.fillStyle = LABEL;
    ctx.font = `600 ${SQUARE * 0.75}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, (fieldColumns * SQUARE) / 2, (rows * SQUARE) / 2);
  }, [columns, rows, fieldColumns, label]);

  return (
    <canvas
      ref={canvas}
      className="render-canvas"
      style={{ aspectRatio: `${columns} / ${rows}` }}
      role="img"
      aria-label={label}
    />
  );
}
