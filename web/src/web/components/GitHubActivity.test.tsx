import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse } from "../../test/fixtures";
import { GitHubActivity } from "./GitHubActivity";

// "Now" is fixed so the 30-day window is predictable; only Date is faked,
// timers stay real for Testing Library's waiting.
const NOW = new Date(2026, 8, 30, 12);
const at = (day: number, hour = 10) => new Date(2026, 8, day, hour).toISOString();

const events = [
  { type: "PushEvent", created_at: at(29), repo: { name: "ada/engine" } },
  { type: "PushEvent", created_at: at(29, 11), repo: { name: "ada/engine" } },
  { type: "PullRequestEvent", created_at: at(29, 12), repo: { name: "ada/notes" } },
  { type: "IssuesEvent", created_at: at(15), repo: { name: "ada/engine" } },
  // outside the window: ignored
  { type: "PushEvent", created_at: new Date(2026, 6, 1).toISOString(), repo: { name: "ada/old" } },
];

describe("GitHubActivity", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("summarises the last 30 days of public events", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse(events)));
    vi.stubGlobal("fetch", fetch);

    render(<GitHubActivity user="ada" />);
    expect(screen.getByText("Loading activity…")).toHaveAttribute("aria-busy", "true");

    const summary = (await screen.findByText(/public events/)).parentElement!;
    expect(summary).toHaveTextContent("4 public events");
    expect(summary).toHaveTextContent("2 active days");
    expect(within(summary).getByRole("link", { name: "ada/engine" })).toHaveAttribute("href", "https://github.com/ada/engine");

    expect(screen.getByRole("img", { name: /4 public GitHub events over the last 30 days/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "@ada" })).toHaveAttribute("href", "https://github.com/ada");
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "https://api.github.com/users/ada/events/public?per_page=100&page=1",
      expect.anything(),
    );
  });

  it("lists the active days in a table", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(events))));
    render(<GitHubActivity user="ada" />);

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Issues 1");
    expect(rows[1]).toHaveTextContent("Pushes 2, Pull requests 1");
  });

  it("reads out each day from the keyboard", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(events))));
    render(<GitHubActivity user="ada" />);
    const plot = await screen.findByRole("img", { name: /public GitHub events/ });

    // End is today (nothing yet), one step left is the 29th
    fireEvent.keyDown(plot, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("0 events");
    fireEvent.keyDown(plot, { key: "ArrowLeft" });
    expect(screen.getByRole("status")).toHaveTextContent("3 events");
    expect(screen.getByRole("status")).toHaveTextContent("Pushes 2");
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("links to the profile when GitHub can't be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ message: "rate limited" }, 403))));

    render(<GitHubActivity user="ada" />);

    expect(await screen.findByText(/isn't available right now/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/ada");
  });

  it("reuses the events cached for the session", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse(events)));
    vi.stubGlobal("fetch", fetch);

    const { unmount } = render(<GitHubActivity user="ada" />);
    await screen.findByText(/public events/);
    unmount();
    render(<GitHubActivity user="ada" />);
    await screen.findByText(/public events/);

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
