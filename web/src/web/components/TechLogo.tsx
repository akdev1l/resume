import type { CSSProperties } from "react";

import { findLogo, isLogoImage, monogram } from "../../core/logos";
import "./tech-logo.css";

// A small square logo: an image path or a Simple Icons name (see core/logos.ts),
// or a monogram of the name when there is no logo. Decorative: the name is
// always shown next to it.
export function TechLogo({ name, logo }: { name: string; logo?: string }) {
  if (isLogoImage(logo)) {
    return (
      <span className="tech-logo" aria-hidden="true">
        <img src={logo} alt="" />
      </span>
    );
  }
  const icon = findLogo(logo);
  if (!icon) {
    return (
      <span className="tech-logo tech-monogram" aria-hidden="true">
        {monogram(name)}
      </span>
    );
  }
  // the colours go in as custom properties so the CSS can pick per theme
  const colors = {
    ...(icon.light && { "--logo-light": icon.light }),
    ...(icon.dark && { "--logo-dark": icon.dark }),
  } as CSSProperties;
  return (
    <span className="tech-logo" style={colors} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={icon.path} />
      </svg>
    </span>
  );
}
