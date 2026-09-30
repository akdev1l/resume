// Public GitHub activity, from the unauthenticated REST API. GitHub only
// keeps about 30 days of public events (at most 300), and allows 60 requests
// an hour per visitor, so results are cached for the browser session.
const API = "https://api.github.com";
const PAGE_SIZE = 100;
const MAX_PAGES = 3;
const CACHE_TTL_MS = 10 * 60 * 1000;

export const ACTIVITY_DAYS = 30;

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: { name: string };
}

export interface DayActivity {
  date: Date;
  total: number;
  byType: Count[];
}

export interface Count {
  label: string;
  count: number;
}

export interface Activity {
  days: DayActivity[];
  total: number;
  activeDays: number;
  byType: Count[];
  byRepo: Count[];
}

const EVENT_LABELS: Record<string, string> = {
  PushEvent: "Pushes",
  PullRequestEvent: "Pull requests",
  PullRequestReviewEvent: "Reviews",
  PullRequestReviewCommentEvent: "Review comments",
  IssuesEvent: "Issues",
  IssueCommentEvent: "Issue comments",
  CommitCommentEvent: "Commit comments",
  CreateEvent: "Branches & repos created",
  DeleteEvent: "Branches deleted",
  ForkEvent: "Forks",
  WatchEvent: "Stars",
  ReleaseEvent: "Releases",
  PublicEvent: "Repos made public",
  MemberEvent: "Collaborators added",
  GollumEvent: "Wiki edits",
};

const eventLabel = (type: string): string => EVENT_LABELS[type] ?? "Other";

export async function fetchPublicEvents(user: string, signal?: AbortSignal): Promise<GitHubEvent[]> {
  const cacheKey = `github-events:${user}`;
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const events: GitHubEvent[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${API}/users/${encodeURIComponent(user)}/events/public?per_page=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url, {
      signal,
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status} for ${url}`);
    }
    const batch = (await response.json()) as GitHubEvent[];
    events.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
  }

  writeCache(cacheKey, events);
  return events;
}

// Daily totals for the last `days` days (today included, local time), plus
// breakdowns by event type and by repository over the whole window.
export function summarize(events: GitHubEvent[], now = new Date(), days = ACTIVITY_DAYS): Activity {
  const today = startOfDay(now);
  const window: DayActivity[] = Array.from({ length: days }, (_, i) => ({
    date: addDays(today, i - days + 1),
    total: 0,
    byType: [],
  }));
  const dayTypes = window.map(() => new Map<string, number>());
  const types = new Map<string, number>();
  const repos = new Map<string, number>();

  for (const event of events) {
    const offset = Math.round(
      (startOfDay(new Date(event.created_at)).getTime() - window[0].date.getTime()) / 86_400_000,
    );
    if (offset < 0 || offset >= days) {
      continue;
    }
    const label = eventLabel(event.type);
    window[offset].total++;
    increment(dayTypes[offset], label);
    increment(types, label);
    increment(repos, event.repo.name);
  }

  window.forEach((day, i) => (day.byType = sortedCounts(dayTypes[i])));

  return {
    days: window,
    total: window.reduce((sum, day) => sum + day.total, 0),
    activeDays: window.filter((day) => day.total > 0).length,
    byType: sortedCounts(types),
    byRepo: sortedCounts(repos),
  };
}

function increment(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const sortedCounts = (counts: Map<string, number>): Count[] =>
  [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// sessionStorage can be missing or throw (private windows, blocked storage);
// the cache is only an optimisation, so every failure just means "no cache".
function readCache(key: string): GitHubEvent[] | null {
  try {
    const entry = JSON.parse(sessionStorage.getItem(key) ?? "null") as {
      at: number;
      events: GitHubEvent[];
    } | null;
    return entry && Date.now() - entry.at < CACHE_TTL_MS ? entry.events : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, events: GitHubEvent[]) {
  try {
    // only the fields the page uses, the full payloads are large
    const slim = events.map(({ type, created_at, repo }) => ({ type, created_at, repo: { name: repo.name } }));
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), events: slim }));
  } catch {
    // ignore, see readCache
  }
}
