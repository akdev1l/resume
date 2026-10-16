import type { ReactNode } from "react";

import "./carousel.css";

// A row of items that scrolls sideways, snapping item by item. Touch and
// trackpads scroll it directly, the keyboard with the arrow keys once it has
// focus. Follows the WAI-ARIA carousel pattern: each item is a slide labelled
// with its position.
export function Carousel({ label, items }: { label: string; items: { key: string; content: ReactNode }[] }) {
  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Focusable so keyboard users can scroll it with the arrow keys. */}
      <div className="carousel-track" tabIndex={0}>
        {items.map((item, i) => (
          <div
            key={item.key}
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
