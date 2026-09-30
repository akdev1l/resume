import { useId, type ReactNode } from "react";

import "./flag.css";

// Small inline flags; emoji flags would show up as bare letters on Windows.
// Decorative only: the language name next to them carries the meaning.
function Spain() {
  return (
    <svg viewBox="0 0 750 500" preserveAspectRatio="xMidYMid slice">
      <rect width="750" height="500" fill="#aa151b" />
      <rect y="125" width="750" height="250" fill="#f1bf00" />
    </svg>
  );
}

function UnitedKingdom() {
  // clip path ids have to be unique on the page
  const id = useId();
  const field = `${id}-field`;
  const diagonals = `${id}-diagonals`;
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">
      <clipPath id={field}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={diagonals}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${field})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${diagonals})`} stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

const FLAGS: Record<string, () => ReactNode> = {
  es: Spain,
  gb: UnitedKingdom,
};

// The flag for a country code, or nothing for codes without one.
export function Flag({ code }: { code?: string }) {
  const Draw = code ? FLAGS[code.toLowerCase()] : undefined;
  if (!Draw) {
    return null;
  }
  return (
    <span className="flag" aria-hidden="true">
      <Draw />
    </span>
  );
}
