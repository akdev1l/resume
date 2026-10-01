import type { CSSProperties } from "react";

import { findLogo, isLogoImage, monogram } from "../../core/logos";
import type { Tech } from "../../core/resume";
import "./tech-tiles.css";

// A grid of technologies or projects: logo, name and a one-line
// description, each tile linking to its site.
export function TechTiles({ items }: { items: Tech[] }) {
  return (
    <ul className="tech-tiles">
      {items.map((item) => (
        <li key={item.name}>
          <TechTile item={item} />
        </li>
      ))}
    </ul>
  );
}

function TechTile({ item }: { item: Tech }) {
  const content = (
    <>
      <TechLogo item={item} />
      <span className="tech-text">
        <strong>{item.name}</strong>
        {item.description && <small>{item.description}</small>}
      </span>
    </>
  );
  return item.url ? (
    <a className="tech-tile" href={item.url}>
      {content}
    </a>
  ) : (
    <div className="tech-tile">{content}</div>
  );
}

function TechLogo({ item }: { item: Tech }) {
  if (isLogoImage(item.logo)) {
    return (
      <span className="tech-logo" aria-hidden="true">
        <img src={item.logo} alt="" />
      </span>
    );
  }
  const logo = findLogo(item.logo);
  if (!logo) {
    return (
      <span className="tech-logo tech-monogram" aria-hidden="true">
        {monogram(item.name)}
      </span>
    );
  }
  // the colours go in as custom properties so the CSS can pick per theme
  const colors = {
    ...(logo.light && { "--logo-light": logo.light }),
    ...(logo.dark && { "--logo-dark": logo.dark }),
  } as CSSProperties;
  return (
    <span className="tech-logo" style={colors} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d={logo.path} />
      </svg>
    </span>
  );
}
