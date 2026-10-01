// Logos for the `logo` field in resume.json: either a Simple Icons (CC0) name
// from the list below, or the path of an image under public/ (starting with
// "/") for logos Simple Icons doesn't have. Only the icons listed here end up
// in the bundle; add one by importing it from simple-icons and mapping it.
import {
  siC,
  siCplusplus,
  siDocker,
  siKubernetes,
  siNeovim,
  siOpenjdk,
  siPython,
  siQt,
  siRust,
  siSfml,
  siTerraform,
  siTypescript,
} from "simple-icons";

const ICONS = {
  c: siC,
  cplusplus: siCplusplus,
  docker: siDocker,
  kubernetes: siKubernetes,
  neovim: siNeovim,
  openjdk: siOpenjdk,
  python: siPython,
  qt: siQt,
  rust: siRust,
  sfml: siSfml,
  terraform: siTerraform,
  typescript: siTypescript,
} as const;

export interface Logo {
  title: string;
  // 24x24 SVG path
  path: string;
  // brand colour per theme, or null where it would vanish into the background
  // (black logos on dark, pale ones on white) and the text colour is used
  light: string | null;
  dark: string | null;
}

// pico's card backgrounds, where the tiles sit
const SURFACES = { light: "#ffffff", dark: "#181c25" };
// below this a logo reads as a smudge; logos are paired with their name, so
// the bar is lower than the 3:1 asked of essential graphics
const MIN_CONTRAST = 2;

// A logo that is an image file rather than a Simple Icons name.
export const isLogoImage = (logo?: string): logo is string => !!logo?.startsWith("/");

export function findLogo(slug?: string): Logo | undefined {
  const icon = slug ? ICONS[slug as keyof typeof ICONS] : undefined;
  if (!icon) {
    return undefined;
  }
  const brand = `#${icon.hex}`;
  return {
    title: icon.title,
    path: icon.path,
    light: contrast(brand, SURFACES.light) >= MIN_CONTRAST ? brand : null,
    dark: contrast(brand, SURFACES.dark) >= MIN_CONTRAST ? brand : null,
  };
}

// A short stand-in for technologies without a logo: short names as they
// are ("AWS"), otherwise the initials of up to two words ("Dear ImGui" -> "DI").
export function monogram(name: string): string {
  if (name.length <= 4) {
    return name;
  }
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// WCAG contrast ratio between two #rrggbb colours.
function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
