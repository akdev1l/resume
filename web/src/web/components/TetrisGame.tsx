import { useCallback, useEffect, useRef, useState } from "react";

import {
  actionForKey,
  drawGame,
  loadTetris,
  newGame,
  PANEL_COLUMNS,
  type Game,
  type MainModule,
} from "../../core/tetris";
import "./render-canvas.css";
import "./tetris-game.css";

const SQUARE = 24;
const ROWS = 20;
const COLUMNS = 10;
// Longest frame gravity catches up on, so a stall (tab switch, debugger)
// doesn't drop a burst of rows at once.
const MAX_FRAME_DELTA_MS = 250;

type Mode = "ready" | "playing" | "paused" | "over";
type Hud = { score: number; lines: number; level: number };

// The Tetris demo: loads the WebAssembly module, then hands over to the stage.
export function TetrisGame() {
  const [tetris, setTetris] = useState<MainModule | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadTetris().then(
      (module) => live && setTetris(module),
      (error: unknown) => {
        console.error("loading the tetris module failed", error);
        if (live) {
          setFailed(true);
        }
      },
    );
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return <p>The game couldn't be loaded in this browser.</p>;
  }
  if (!tetris) {
    return <p aria-busy="true">Loading the WebAssembly module…</p>;
  }
  return <TetrisStage tetris={tetris} />;
}

// Keys typed into form fields or used with modifiers are not for the game.
const ignoredKey = (e: KeyboardEvent) =>
  e.ctrlKey ||
  e.metaKey ||
  e.altKey ||
  (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, button, a") !== null);

function TetrisStage({ tetris }: { tetris: MainModule }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const [mode, setModeState] = useState<Mode>("ready");
  const [hud, setHud] = useState<Hud>({ score: 0, lines: 0, level: 1 });
  // the animation loop and key handler read the latest mode through this ref;
  // setMode keeps it in step with the state, without touching it in render
  const modeRef = useRef<Mode>("ready");
  const setMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  // embind objects live in wasm memory and have to be freed by hand
  useEffect(() => {
    game.current = newGame(tetris);
    return () => {
      game.current?.delete();
      game.current = null;
    };
  }, [tetris]);

  const start = useCallback(() => {
    if (modeRef.current === "over") {
      game.current?.delete();
      game.current = newGame(tetris);
    }
    setMode("playing");
  }, [tetris, setMode]);

  const act = useCallback((key: string) => {
    const g = game.current;
    const action = actionForKey(tetris, key);
    if (!g || !action || modeRef.current !== "playing") {
      return;
    }
    g.apply(action);
    if (g.over) {
      setMode("over");
    }
  }, [tetris, setMode]);

  // One requestAnimationFrame loop does gravity and drawing. Gravity runs on
  // accumulated delta time, not on frames: every frame adds the time since
  // the last one and the game ticks once per whole gravity interval in it,
  // so the fall speed is the same at 30, 60 or 144 Hz, even at levels whose
  // interval is shorter than a frame.
  useEffect(() => {
    const element = canvas.current!;
    const ctx = element.getContext("2d");
    if (!ctx) {
      return;
    }
    const scale = window.devicePixelRatio || 1;
    element.width = (COLUMNS + PANEL_COLUMNS) * SQUARE * scale;
    element.height = ROWS * SQUARE * scale;
    ctx.scale(scale, scale);

    let frame = 0;
    let last = performance.now();
    let pending = 0; // gravity time not yet spent on ticks, in ms
    const loop = (now: number) => {
      const delta = Math.min(now - last, MAX_FRAME_DELTA_MS);
      last = now;
      const g = game.current;
      if (g) {
        if (modeRef.current !== "playing") {
          pending = 0; // paused time doesn't count towards gravity
        } else {
          pending += delta;
          // the interval is re-read each tick: clearing lines can level up
          while (!g.over && pending >= g.gravityIntervalMs) {
            pending -= g.gravityIntervalMs;
            g.tick();
          }
          if (g.over) {
            setMode("over");
          }
        }
        drawGame(ctx, g, SQUARE);
        setHud((prev) =>
          prev.score === g.score && prev.lines === g.lines && prev.level === g.level
            ? prev
            : { score: g.score, lines: g.lines, level: g.level },
        );
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [setMode]);

  // keyboard: the desktop controls, plus Enter to start and P/Escape to pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ignoredKey(e)) {
        return;
      }
      const current = modeRef.current;
      if (current === "playing") {
        if (e.key === "p" || e.key === "P" || e.key === "Escape") {
          setMode("paused");
        } else if (actionForKey(tetris, e.key)) {
          act(e.key);
        } else {
          return;
        }
      } else if (e.key === "Enter" || (current === "over" && (e.key === "r" || e.key === "R"))) {
        start();
      } else {
        return;
      }
      // keep arrows and space from scrolling the page while playing
      e.preventDefault();
    };
    const pause = () => {
      if (modeRef.current === "playing") {
        setMode("paused");
      }
    };
    const onVisibility = () => document.hidden && pause();

    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tetris, act, start, setMode]);

  return (
    <div className="tetris">
      <div className="tetris-stage">
        <canvas
          ref={canvas}
          className="render-canvas"
          style={{ aspectRatio: `${COLUMNS + PANEL_COLUMNS} / ${ROWS}` }}
          role="img"
          aria-label="Tetris playfield"
        />
        {mode !== "playing" && <Overlay mode={mode} score={hud.score} onStart={start} />}
      </div>

      <p className="tetris-hud">
        <span>
          Score <strong>{hud.score}</strong>
        </span>
        <span>
          Lines <strong>{hud.lines}</strong>
        </span>
        <span>
          Level <strong>{hud.level}</strong>
        </span>
      </p>

      <TouchControls onKey={act} />
    </div>
  );
}

function Overlay({ mode, score, onStart }: { mode: Exclude<Mode, "playing">; score: number; onStart: () => void }) {
  const text = {
    ready: { title: "Tetris", hint: "Press Enter or", button: "Play" },
    paused: { title: "Paused", hint: "Press Enter or", button: "Resume" },
    over: { title: `Game over · ${score}`, hint: "Press R or", button: "Play again" },
  }[mode];

  return (
    <div className="tetris-overlay">
      <strong>{text.title}</strong>
      <button type="button" onClick={onStart}>
        {text.button}
      </button>
      <small>{text.hint} tap the button</small>
    </div>
  );
}

// Buttons for touch screens. They never take focus, so the keyboard keeps
// driving the game after a tap.
function TouchControls({ onKey }: { onKey: (key: string) => void }) {
  const buttons = [
    { key: "ArrowLeft", label: "Move left", icon: "←" },
    { key: "z", label: "Rotate counter-clockwise", icon: "⟲" },
    { key: "x", label: "Rotate clockwise", icon: "⟳" },
    { key: "ArrowRight", label: "Move right", icon: "→" },
    { key: "ArrowDown", label: "Soft drop", icon: "↓" },
    { key: " ", label: "Hard drop", icon: "⤓" },
  ];
  return (
    <div className="tetris-touch" role="group" aria-label="Game controls">
      {buttons.map(({ key, label, icon }) => (
        <button
          key={label}
          type="button"
          className="secondary outline"
          aria-label={label}
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onKey(key)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
