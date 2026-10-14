import { useEffect, useRef, useState, type ReactNode } from "react";

import "./carousel.css";

// Where the strip is scrolled to; the buttons only show when it overflows.
interface ScrollState {
  overflows: boolean;
  atStart: boolean;
  atEnd: boolean;
}

const NOT_MEASURED: ScrollState = { overflows: false, atStart: true, atEnd: true };

// Scroll positions are fractional on zoomed or high-DPI screens.
const EDGE_TOLERANCE_PX = 1;

function measure(track: HTMLElement): ScrollState {
  const { scrollLeft, scrollWidth, clientWidth } = track;
  return {
    overflows: scrollWidth > clientWidth + EDGE_TOLERANCE_PX,
    atStart: scrollLeft <= EDGE_TOLERANCE_PX,
    atEnd: scrollLeft + clientWidth >= scrollWidth - EDGE_TOLERANCE_PX,
  };
}

// A row of items that scrolls sideways, snapping item by item. Touch and
// trackpads scroll it directly, the keyboard with the arrow keys once it has
// focus, and the previous/next buttons page through it when it overflows.
export function Carousel({ label, items }: { label: string; items: { key: string; content: ReactNode }[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [scroll, setScroll] = useState(NOT_MEASURED);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setScroll(measure(track));
    // Also fires once right away, with the first layout.
    const resizes = new ResizeObserver(update);
    resizes.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => {
      resizes.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, []);

  const page = (direction: -1 | 1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      {scroll.overflows && (
        <div className="carousel-controls">
          <button type="button" className="secondary outline" aria-label="Previous" disabled={scroll.atStart} onClick={() => page(-1)}>
            ‹
          </button>
          <button type="button" className="secondary outline" aria-label="Next" disabled={scroll.atEnd} onClick={() => page(1)}>
            ›
          </button>
        </div>
      )}
      {/* Focusable so keyboard users can scroll it with the arrow keys. */}
      <ul ref={trackRef} className="carousel-track" tabIndex={0}>
        {items.map((item) => (
          <li key={item.key}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
}
