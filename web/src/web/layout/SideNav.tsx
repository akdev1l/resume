import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router";

import { PDF_PATH, sectionPath } from "../../core/route";
import { SECTIONS } from "../../core/sections";

// Section list that stays tucked away at the left edge, leaving only a pull
// tab. Mice open it by hovering; touch and keyboard use the tab as a button.
export function SideNav() {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLElement>(null);

  // close on Escape or on any press outside the drawer
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: globalThis.PointerEvent) => {
      if (!drawer.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // hover only for real mice: on touch screens pointerenter fires right
  // before the tap, which would open and immediately toggle closed again
  const hover = (value: boolean) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      setOpen(value);
    }
  };

  const close = () => setOpen(false);

  return (
    <aside
      ref={drawer}
      className="side-nav"
      data-open={open || undefined}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
    >
      <nav id="side-nav-panel" className="side-nav-panel" aria-label="Resume sections" inert={!open}>
        <ul>
          {SECTIONS.map(({ id, title }) => (
            <li key={id}>
              <Link to={sectionPath(id)} onClick={close}>
                {title}
              </Link>
            </li>
          ))}
          <li className="side-nav-extra">
            <Link to={PDF_PATH} onClick={close}>
              PDF version
            </Link>
          </li>
        </ul>
      </nav>
      <button
        type="button"
        className="side-nav-handle"
        aria-controls="side-nav-panel"
        aria-expanded={open}
        aria-label={open ? "Hide sections" : "Show sections"}
        onClick={() => setOpen(!open)}
      />
    </aside>
  );
}
