import { useEffect, useState, type KeyboardEvent, type PointerEvent } from "react";

import { ACTIVITY_DAYS, fetchPublicEvents, summarize, type Activity, type Count } from "../../core/github";
import "./github-activity.css";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; activity: Activity };

const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const axisFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Gridlines at round numbers: the top of the scale and its midpoint.
function scaleTicks(max: number): number[] {
  const top = Math.max(2, Math.ceil(max / 2) * 2);
  return [top / 2, top];
}

interface GitHubActivityProps {
  user: string;
}

// Public GitHub activity of `user` over the last 30 days, one bar per day.
export function GitHubActivity({ user }: GitHubActivityProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const abort = new AbortController();
    fetchPublicEvents(user, abort.signal).then(
      (events) => setState({ status: "ready", activity: summarize(events) }),
      (error: unknown) => {
        if (!abort.signal.aborted) {
          console.error(error);
          setState({ status: "error" });
        }
      },
    );
    return () => abort.abort();
  }, [user]);

  const profile = `https://github.com/${user}`;

  return (
    <figure className="gh-activity">
      <figcaption>
        <strong>GitHub activity</strong>, last {ACTIVITY_DAYS} days ·{" "}
        <a href={profile}>@{user}</a>
      </figcaption>
      {state.status === "loading" && <p aria-busy="true">Loading activity…</p>}
      {state.status === "error" && (
        <p>
          GitHub activity isn't available right now. See it on <a href={profile}>GitHub</a> instead.
        </p>
      )}
      {state.status === "ready" && <ActivityView activity={state.activity} />}
    </figure>
  );
}

function ActivityView({ activity }: { activity: Activity }) {
  const [active, setActive] = useState<number | null>(null);
  const { days } = activity;
  const ticks = scaleTicks(Math.max(...days.map((d) => d.total)));
  const top = ticks[ticks.length - 1];
  const topRepo = activity.byRepo[0];

  // the whole column is the hit target, not just the painted bar
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const index = Math.floor(((e.clientX - box.left) / box.width) * days.length);
    setActive(Math.min(days.length - 1, Math.max(0, index)));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      setActive((i) => Math.min(days.length - 1, Math.max(0, (i ?? days.length) + step)));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : days.length - 1);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  const day = active === null ? null : days[active];

  return (
    <>
      <p className="gh-stats">
        <span>
          <strong>{activity.total}</strong> public events
        </span>
        <span>
          <strong>{activity.activeDays}</strong> active days
        </span>
        {topRepo && (
          <span>
            most active in <a href={`https://github.com/${topRepo.label}`}>{topRepo.label}</a>
          </span>
        )}
      </p>

      <div className="gh-chart">
        <div className="gh-grid" aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className="gh-gridline" style={{ bottom: `${(tick / top) * 100}%` }}>
              <span>{tick}</span>
            </div>
          ))}
        </div>
        <div
          className="gh-plot"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          role="img"
          tabIndex={0}
          aria-label={`${activity.total} public GitHub events over the last ${ACTIVITY_DAYS} days. Use the left and right arrow keys to read each day.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          {days.map((d, i) => (
            <div key={d.date.getTime()} className="gh-column" data-active={i === active || undefined}>
              {d.total > 0 && <div className="gh-bar" style={{ height: `${(d.total / top) * 100}%` }} />}
            </div>
          ))}
          {day && active !== null && (
            <div
              className="gh-tooltip"
              role="status"
              data-edge={active < 5 ? "start" : active >= days.length - 5 ? "end" : undefined}
              style={{ left: `${((active + 0.5) / days.length) * 100}%` }}
            >
              <strong>{plural(day.total, "event")}</strong>
              <small>{dayFormat.format(day.date)}</small>
              <Breakdown counts={day.byType} />
            </div>
          )}
        </div>
        <div className="gh-axis" aria-hidden="true">
          <span>{axisFormat.format(days[0].date)}</span>
          <span>{axisFormat.format(days[Math.floor(days.length / 2)].date)}</span>
          <span>Today</span>
        </div>
      </div>

      {activity.byType.length > 0 && (
        <p className="gh-types">
          {activity.byType.map(({ label, count }) => (
            <span key={label}>
              {label} <strong>{count}</strong>
            </span>
          ))}
        </p>
      )}

      <details className="gh-table">
        <summary>Show as table</summary>
        <table>
          <caption>Days with public activity (days without any are left out)</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Events</th>
              <th scope="col">Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {days
              .filter((d) => d.total > 0)
              .map((d) => (
                <tr key={d.date.getTime()}>
                  <th scope="row">{dayFormat.format(d.date)}</th>
                  <td>{d.total}</td>
                  <td>{d.byType.map((t) => `${t.label} ${t.count}`).join(", ")}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

function Breakdown({ counts }: { counts: Count[] }) {
  if (counts.length === 0) {
    return null;
  }
  return (
    <ul>
      {counts.map(({ label, count }) => (
        <li key={label}>
          <span>{label}</span> <strong>{count}</strong>
        </li>
      ))}
    </ul>
  );
}
