import { describe, expect, it, vi } from "vitest";

import { jsonResponse } from "../test/fixtures";
import { ACTIVITY_DAYS, fetchPublicEvents, summarize, type GitHubEvent } from "./github";

const NOW = new Date(2026, 8, 30, 12);
const event = (type: string, date: Date, repo = "ada/engine"): GitHubEvent => ({
  type,
  created_at: date.toISOString(),
  repo: { name: repo },
});

describe("summarize", () => {
  it("covers the last 30 days, ending today", () => {
    const { days } = summarize([], NOW);
    expect(days).toHaveLength(ACTIVITY_DAYS);
    expect(days[0].date).toEqual(new Date(2026, 8, 1));
    expect(days.at(-1)!.date).toEqual(new Date(2026, 8, 30));
  });

  it("counts events per day, per type and per repository", () => {
    const activity = summarize(
      [
        event("PushEvent", new Date(2026, 8, 30, 9)),
        event("PushEvent", new Date(2026, 8, 30, 23, 59)),
        event("WatchEvent", new Date(2026, 8, 1, 0, 0), "ada/notes"),
        event("SomethingNewEvent", new Date(2026, 8, 15)),
      ],
      NOW,
    );

    expect(activity.total).toBe(4);
    expect(activity.activeDays).toBe(3);
    expect(activity.days.at(-1)).toMatchObject({ total: 2, byType: [{ label: "Pushes", count: 2 }] });
    expect(activity.byType).toEqual([
      { label: "Pushes", count: 2 },
      { label: "Stars", count: 1 },
      { label: "Other", count: 1 },
    ]);
    expect(activity.byRepo[0]).toEqual({ label: "ada/engine", count: 3 });
  });

  it("ignores events outside the window", () => {
    const activity = summarize(
      [event("PushEvent", new Date(2026, 7, 31, 23)), event("PushEvent", new Date(2026, 9, 1, 1))],
      NOW,
    );
    expect(activity.total).toBe(0);
  });
});

describe("fetchPublicEvents", () => {
  const page = (size: number) => Array.from({ length: size }, () => event("PushEvent", NOW));

  it("pages through until a short page, up to three", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(page(100)))
      .mockResolvedValueOnce(jsonResponse(page(40)));
    vi.stubGlobal("fetch", fetch);

    expect(await fetchPublicEvents("ada")).toHaveLength(140);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toContain("page=2");
  });

  it("stops after three pages", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse(page(100))));
    vi.stubGlobal("fetch", fetch);

    expect(await fetchPublicEvents("bob")).toHaveLength(300);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("caches the slimmed-down events for the session", async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse([{ ...event("PushEvent", NOW), payload: { big: true } }])));
    vi.stubGlobal("fetch", fetch);

    await fetchPublicEvents("carol");
    const again = await fetchPublicEvents("carol");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(again[0]).not.toHaveProperty("payload");
  });

  it("fails on an error response", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({}, 403))));
    await expect(fetchPublicEvents("dave")).rejects.toThrow("GitHub API returned 403");
  });
});
