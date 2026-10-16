import type { Tech } from "../../core/resume";
import { TechLogo } from "./TechLogo";
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
      <TechLogo name={item.name} logo={item.logo} />
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
