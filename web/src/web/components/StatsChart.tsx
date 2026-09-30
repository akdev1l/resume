import type { Resume } from "../../core/resume";

const RINGS = [0.25, 0.5, 0.75, 1];

// Same chart as \skillchart in main.tex: one axis per stat, first one at the
// top, going counter-clockwise; values go from 0 to 1.
export function StatsChart({ stats }: { stats: Resume["stats"] }) {
  const step = (2 * Math.PI) / stats.length;
  // svg y grows downwards, hence the minus
  const point = (i: number, r: number) => {
    const angle = Math.PI / 2 + i * step;
    return [r * Math.cos(angle), -r * Math.sin(angle)] as const;
  };
  const polygon = (radius: (i: number) => number) =>
    stats.map((_, i) => point(i, radius(i)).join(",")).join(" ");

  return (
    <svg className="stats-chart" viewBox="-1.7 -1.45 3.4 2.9" role="img" aria-label="Skill chart">
      <title>{stats.map((s) => `${s.label}: ${Math.round(s.value * 100)}%`).join(", ")}</title>
      <g className="stats-grid">
        {RINGS.map((r) => (
          <polygon key={r} points={polygon(() => r)} />
        ))}
        {stats.map((s, i) => {
          const [x, y] = point(i, 1);
          return <line key={s.label} x1={0} y1={0} x2={x} y2={y} />;
        })}
      </g>
      <polygon className="stats-value" points={polygon((i) => stats[i].value)} />
      {stats.map((s, i) => {
        const [x, y] = point(i, 1.3);
        return (
          <text key={s.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}
