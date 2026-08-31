"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";

const STORAGE_KEY = "status:refresh-interval-ms";

const INTERVALS = [
  { id: 5 * 60_000, label: "5m" },
  { id: 10 * 60_000, label: "10m" },
  { id: 20 * 60_000, label: "20m" },
  { id: 60 * 60_000, label: "1h" },
  { id: 180 * 60_000, label: "3h" },
] as const;

type IntervalMs = (typeof INTERVALS)[number]["id"];

// Matches the interval the cron job on Render actually checks services at, so
// the dashboard's default polling can't outrun data that never changed.
const DEFAULT_INTERVAL_MS: IntervalMs = 5 * 60_000;

function isIntervalMs(value: unknown): value is IntervalMs {
  return INTERVALS.some((interval) => interval.id === value);
}

/**
 * The chosen poll interval lives in localStorage so it survives navigation,
 * read through an external store to stay hydration-safe (see domain-list.tsx).
 */
const listeners = new Set<() => void>();
let fallbackInterval: IntervalMs = DEFAULT_INTERVAL_MS;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readInterval(): IntervalMs {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (isIntervalMs(stored)) return stored;
  } catch {
    // Private mode or blocked storage — fall through to the in-memory value.
  }
  return fallbackInterval;
}

function writeInterval(next: IntervalMs) {
  fallbackInterval = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
  for (const onChange of listeners) onChange();
}

function formatAge(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Reports when the newest check in the database actually ran — not when this
 * component last mounted — and pulls fresh server data on a user-selectable
 * interval (persisted, defaulting to the cron's own 5-minute cadence).
 */
export function AutoRefresh({ lastCheckedAt, isStale }: { lastCheckedAt: string | null; isStale: boolean }) {
  const router = useRouter();
  const isClient = useIsClient();
  const [age, setAge] = useState<string | null>(null);
  const intervalMs = useSyncExternalStore(subscribe, readInterval, () => DEFAULT_INTERVAL_MS);

  useEffect(() => {
    const tick = () => {
      setAge(lastCheckedAt ? formatAge(Date.now() - new Date(lastCheckedAt).getTime()) : null);
    };

    tick();
    const tickTimer = setInterval(tick, 1000);
    // POSTs to /api/refresh so this actually re-checks every service (and, as a
    // side effect, pings the server often enough to stop Render's free tier from
    // sleeping it) rather than just re-reading whatever the DB already has.
    // Ignores failures (e.g. rate limiting) — it's a background convenience, not
    // the only way to get fresh data.
    const refreshTimer = setInterval(() => {
      fetch("/api/refresh", { method: "POST" })
        .catch(() => null)
        .finally(() => router.refresh());
    }, intervalMs);

    return () => {
      clearInterval(tickTimer);
      clearInterval(refreshTimer);
    };
  }, [lastCheckedAt, router, intervalMs]);

  const dotClass = isStale || !lastCheckedAt ? "bg-status-warning" : "bg-status-good";

  return (
    <div className="flex items-center gap-3">
      <p
        className="flex items-center gap-1.5 text-xs text-ink-muted"
        title={
          !lastCheckedAt
            ? "No health check has run yet"
            : isClient
              ? new Date(lastCheckedAt).toLocaleString()
              : undefined
        }
      >
        <span className="relative flex h-1.5 w-1.5">
          {!isStale && lastCheckedAt ? (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dotClass)} />
          ) : null}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotClass)} />
        </span>
        {!lastCheckedAt ? "No checks yet" : age ? `Checked ${age}` : "Checked recently"}
      </p>

      <div
        className="inline-flex rounded-full border border-hairline p-0.5"
        role="group"
        aria-label="Auto-refresh interval"
        title="How often this page pulls the latest recorded checks"
      >
        {INTERVALS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => writeInterval(option.id)}
            aria-pressed={intervalMs === option.id}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
              intervalMs === option.id ? "bg-accent/10 text-accent" : "text-ink-secondary hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
