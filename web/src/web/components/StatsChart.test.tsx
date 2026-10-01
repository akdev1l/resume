import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatsChart } from "./StatsChart";

const stats = [
  { label: "Maths", value: 1 },
  { label: "Poetry", value: 0.5 },
  { label: "Engines", value: 0.75 },
];

describe("StatsChart", () => {
  it("labels every axis and describes the values", () => {
    render(<StatsChart stats={stats} />);
    const chart = screen.getByRole("img", { name: "Skill chart" });

    for (const { label } of stats) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(chart.querySelector("title")).toHaveTextContent("Maths: 100%, Poetry: 50%, Engines: 75%");
  });

  it("draws four grid rings, one axis per stat and the value polygon", () => {
    const { container } = render(<StatsChart stats={stats} />);
    expect(container.querySelectorAll(".stats-grid polygon")).toHaveLength(4);
    expect(container.querySelectorAll(".stats-grid line")).toHaveLength(stats.length);

    // the first stat points straight up, at its value's distance
    const [x, y] = container.querySelector(".stats-value")!.getAttribute("points")!.split(" ")[0].split(",").map(Number);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(-1);
  });
});
