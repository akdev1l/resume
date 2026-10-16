import type { ReactNode } from "react";

import "./carousel.css";

// A row of items that scrolls sideways, snapping item by item. Touch and
// trackpads scroll it directly, the keyboard with the arrow keys once it has
// focus.
export function Carousel({ label, items }: { label: string; items: { key: string; content: ReactNode }[] }) {
  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Focusable so keyboard users can scroll it with the arrow keys. */}
      <ul className="carousel-track" tabIndex={0}>
        {items.map((item) => (
          <li key={item.key}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
}
