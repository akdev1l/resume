import { useState, type ReactNode } from "react";

import { savedTheme, setTheme, type ThemeChoice } from "../../core/theme";
import { SegmentedControl, type Segment } from "../components/SegmentedControl";

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const SEGMENTS: Segment<ThemeChoice>[] = [
  {
    value: "light",
    label: "Light theme",
    content: icon(
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>,
    ),
  },
  {
    value: "system",
    label: "System theme",
    content: icon(
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>,
    ),
  },
  {
    value: "dark",
    label: "Dark theme",
    content: icon(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />),
  },
];

// Light / system / dark.
export function ThemeSwitcher() {
  const [choice, setChoice] = useState<ThemeChoice>(savedTheme);

  const choose = (value: ThemeChoice) => {
    setTheme(value);
    setChoice(value);
  };

  return <SegmentedControl label="Colour theme" segments={SEGMENTS} value={choice} onChange={choose} />;
}
