import type { LatencyHistory, LatencyRange, LatencyRangeView, ServiceLatency } from "@/lib/types";

export interface RawCheck {
  status: "up" | "down";
  latencyMs: number | null;
  checkedAt: Date;
}

export type LiveStatus = "up" | "down" | "unknown";

export interface LatencyPoint {
  t: number;
  latencyMs: number | null;
}

/**
 * One drawn slice of a day. Consecutive checks that agree collapse into a
 * single segment, so every state change during a day adds another segment
 * instead of overwriting the day's colour.
 */
export interface UptimeSegment {
  startMs: number;
  endMs: number;
  totalChecks: number;
  upChecks: number;
  uptimePct: number;
}

export interface DayBucket {
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  uptimePct: number | null;
  totalChecks: number;
  segments: UptimeSegment[];
}

export interface DomainAggregate {
  currentStatus: LiveStatus;
  currentLatencyMs: number | null;
  lastCheckedAt: Date | null;
  /** Latest check is older than the staleness window — the badge is a memory, not a live reading. */
  isStale: boolean;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgLatency24h: number | null;
  latencySeries24h: LatencyPoint[];
  dayBuckets: DayBucket[];
  incidents24h: number;
}

export interface AggregateOptions {
  /** Wall clock to aggregate against; injectable for tests. */
  now?: Date;
  /** How long a check stays "current" before the card is marked stale. */
  staleAfterMs?: number;
  days?: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// 1.5x the 30-minute check cadence, so data isn't flagged stale just before the next check lands.
export const DEFAULT_STALE_AFTER_MS = 45 * 60 * 1000;
export const HISTORY_DAYS = 45;

/** A day column this wide can only render so many slices before they turn to noise. */
const MAX_SEGMENTS_PER_DAY = 6;

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function uptimePctFor(checks: RawCheck[], sinceMs: number): number | null {
  const inWindow = checks.filter((c) => c.checkedAt.getTime() >= sinceMs);
  if (inWindow.length === 0) return null;
  const up = inWindow.filter((c) => c.status === "up").length;
  return (up / inWindow.length) * 100;
}

function avgLatencyFor(checks: RawCheck[], sinceMs: number): number | null {
  const values = checks
    .filter((c) => c.checkedAt.getTime() >= sinceMs && c.status === "up" && c.latencyMs != null)
    .map((c) => c.latencyMs as number);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function toSegment(run: RawCheck[]): UptimeSegment {
  const upChecks = run.filter((c) => c.status === "up").length;
  return {
    startMs: run[0].checkedAt.getTime(),
    endMs: run[run.length - 1].checkedAt.getTime(),
    totalChecks: run.length,
    upChecks,
    uptimePct: (upChecks / run.length) * 100,
  };
}

/** Merge the smallest run into its smaller neighbour until the day fits `MAX_SEGMENTS_PER_DAY`. */
function collapseRuns(runs: RawCheck[][]): RawCheck[][] {
  const merged = runs.map((run) => [...run]);

  while (merged.length > MAX_SEGMENTS_PER_DAY) {
    let smallest = 0;
    for (let i = 1; i < merged.length; i++) {
      if (merged[i].length < merged[smallest].length) smallest = i;
    }

    const left = smallest > 0 ? merged[smallest - 1] : null;
    const right = smallest < merged.length - 1 ? merged[smallest + 1] : null;
    const neighbour = !left ? smallest + 1 : !right ? smallest - 1 : left.length <= right.length ? smallest - 1 : smallest + 1;

    const first = Math.min(smallest, neighbour);
    merged.splice(first, 2, [...merged[first], ...merged[first + 1]]);
  }

  return merged;
}

/** `dayChecksAsc` must be sorted ascending by checkedAt. */
function buildSegments(dayChecksAsc: RawCheck[]): UptimeSegment[] {
  if (dayChecksAsc.length === 0) return [];

  const runs: RawCheck[][] = [];
  for (const check of dayChecksAsc) {
    const current = runs[runs.length - 1];
    if (current && current[current.length - 1].status === check.status) {
      current.push(check);
    } else {
      runs.push([check]);
    }
  }

  return collapseRuns(runs).map(toSegment);
}

function buildDayBuckets(checks: RawCheck[], days: number, now: Date): DayBucket[] {
  const byDay = new Map<string, RawCheck[]>();
  for (const check of checks) {
    const key = localDateKey(check.checkedAt);
    const existing = byDay.get(key);
    if (existing) existing.push(check);
    else byDay.set(key, [check]);
  }

  const buckets: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = localDateKey(dayStart);
    const dayChecks = (byDay.get(key) ?? [])
      .slice()
      .sort((a, b) => a.checkedAt.getTime() - b.checkedAt.getTime());

    const upChecks = dayChecks.filter((c) => c.status === "up").length;

    buckets.push({
      date: key,
      uptimePct: dayChecks.length ? (upChecks / dayChecks.length) * 100 : null,
      totalChecks: dayChecks.length,
      segments: buildSegments(dayChecks),
    });
  }

  return buckets;
}

function countIncidents(checksAsc: RawCheck[]): number {
  let incidents = 0;
  for (let i = 0; i < checksAsc.length; i++) {
    if (checksAsc[i].status === "down" && (i === 0 || checksAsc[i - 1].status === "up")) {
      incidents++;
    }
  }
  return incidents;
}

/** `checks` should be sorted descending by checkedAt (most recent first). */
export function aggregateDomain(checks: RawCheck[], options: AggregateOptions = {}): DomainAggregate {
  const nowDate = options.now ?? new Date();
  const now = nowDate.getTime();
  const staleAfterMs = options.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
  const days = options.days ?? HISTORY_DAYS;

  if (checks.length === 0) {
    return {
      currentStatus: "unknown",
      currentLatencyMs: null,
      lastCheckedAt: null,
      isStale: false,
      uptime24h: null,
      uptime7d: null,
      uptime30d: null,
      avgLatency24h: null,
      latencySeries24h: [],
      dayBuckets: buildDayBuckets([], days, nowDate),
      incidents24h: 0,
    };
  }

  const latest = checks[0];
  const checksAsc = [...checks].reverse();
  const last24h = checksAsc.filter((c) => c.checkedAt.getTime() >= now - DAY);

  return {
    currentStatus: latest.status,
    currentLatencyMs: latest.latencyMs,
    lastCheckedAt: latest.checkedAt,
    isStale: now - latest.checkedAt.getTime() > staleAfterMs,
    uptime24h: uptimePctFor(checks, now - DAY),
    uptime7d: uptimePctFor(checks, now - 7 * DAY),
    uptime30d: uptimePctFor(checks, now - 30 * DAY),
    avgLatency24h: avgLatencyFor(checks, now - DAY),
    latencySeries24h: last24h.map((c) => ({ t: c.checkedAt.getTime(), latencyMs: c.latencyMs })),
    dayBuckets: buildDayBuckets(checks, days, nowDate),
    incidents24h: countIncidents(last24h),
  };
}

/**
 * Bucket width per chart range. Buckets are aligned to epoch time, so "30d" days start at
 * UTC midnight. ponytail: shift by the viewer's UTC offset if day boundaries ever matter.
 */
const LATENCY_RANGES: Record<LatencyRange, { bucketMs: number; count: number }> = {
  "24h": { bucketMs: HOUR, count: 24 },
  "7d": { bucketMs: 6 * HOUR, count: 28 },
  "30d": { bucketMs: DAY, count: 30 },
};

function mean(values: number[]): number | null {
  return values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null;
}

/** Nearest-rank percentile; `sortedAsc` must be sorted ascending. */
function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.ceil(p * sortedAsc.length) - 1)];
}

function latencyRangeView(
  services: { id: string; name: string; checks: RawCheck[] }[],
  nowMs: number,
  { bucketMs, count }: { bucketMs: number; count: number },
): LatencyRangeView {
  const firstStart = Math.floor(nowMs / bucketMs) * bucketMs - (count - 1) * bucketMs;
  const raw = Array.from({ length: count }, () => ({ values: [] as number[], checks: 0, failures: 0 }));

  const serviceViews: ServiceLatency[] = services.map(({ id, name, checks }) => {
    const values: number[] = [];
    for (const check of checks) {
      const i = Math.floor((check.checkedAt.getTime() - firstStart) / bucketMs);
      if (i < 0 || i >= count) continue;
      raw[i].checks++;
      // Same rule as avgLatencyFor: a failed request's timing isn't a latency reading.
      if (check.status !== "up") raw[i].failures++;
      else if (check.latencyMs != null) {
        raw[i].values.push(check.latencyMs);
        values.push(check.latencyMs);
      }
    }
    return { id, name, avgMs: mean(values) };
  });

  const all = raw.flatMap((b) => b.values).sort((a, b) => a - b);

  return {
    buckets: raw.map((b, i) => ({
      start: firstStart + i * bucketMs,
      end: firstStart + (i + 1) * bucketMs,
      avgMs: mean(b.values),
      minMs: b.values.length ? Math.min(...b.values) : null,
      maxMs: b.values.length ? Math.max(...b.values) : null,
      checks: b.checks,
      failures: b.failures,
    })),
    avgMs: mean(all),
    p95Ms: percentile(all, 0.95),
    peakMs: all.length ? all[all.length - 1] : null,
    checks: raw.reduce((sum, b) => sum + b.checks, 0),
    failures: raw.reduce((sum, b) => sum + b.failures, 0),
    services: serviceViews.sort((a, b) => (b.avgMs ?? -1) - (a.avgMs ?? -1)),
  };
}

/** Latency across every service for each chart range. */
export function buildLatencyHistory(
  services: { id: string; name: string; checks: RawCheck[] }[],
  now: Date,
): LatencyHistory {
  const nowMs = now.getTime();
  return {
    "24h": latencyRangeView(services, nowMs, LATENCY_RANGES["24h"]),
    "7d": latencyRangeView(services, nowMs, LATENCY_RANGES["7d"]),
    "30d": latencyRangeView(services, nowMs, LATENCY_RANGES["30d"]),
  };
}
