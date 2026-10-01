import type { ReactNode } from "react";

import "./segmented-control.css";

export interface Segment<T extends string> {
  value: T;
  // accessible name, also shown as a tooltip
  label: string;
  // what the button shows: an icon or a short text like "EN"
  content: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

// A compact "pick one" control: a pill of buttons, the chosen one filled.
// Used by the top bar's settings (theme, and the language later on).
export function SegmentedControl<T extends string>({ label, segments, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          aria-label={segment.label}
          title={segment.label}
          aria-pressed={segment.value === value}
          onClick={() => onChange(segment.value)}
        >
          {segment.content}
        </button>
      ))}
    </div>
  );
}
