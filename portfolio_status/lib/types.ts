export type LiveStatus = "up" | "down" | "unknown";

export interface LatencyPointView {
  t: number;
  latencyMs: number | null;
}

export interface UptimeSegmentView {
  startMs: number;
  endMs: number;
  totalChecks: number;
  upChecks: number;
  uptimePct: number;
}

export interface DayBucketView {
  date: string;
  uptimePct: number | null;
  totalChecks: number;
  segments: UptimeSegmentView[];
}

export type LatencyRange = "24h" | "7d" | "30d";

export interface LatencyBucket {
  /** Bucket start, epoch ms. */
  start: number;
  end: number;
  /** Over successful checks only; null when none landed in the bucket. */
  avgMs: number | null;
  minMs: number | null;
  maxMs: number | null;
  checks: number;
  failures: number;
}

export interface ServiceLatency {
  id: string;
  name: string;
  avgMs: number | null;
}

export interface LatencyRangeView {
  buckets: LatencyBucket[];
  avgMs: number | null;
  p95Ms: number | null;
  peakMs: number | null;
  checks: number;
  failures: number;
  /** Slowest first; services without data last. */
  services: ServiceLatency[];
}

export type LatencyHistory = Record<LatencyRange, LatencyRangeView>;

export interface DomainView {
  id: string;
  name: string;
  url: string;
  currentStatus: LiveStatus;
  currentLatencyMs: number | null;
  lastCheckedAt: string | null;
  isStale: boolean;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgLatency24h: number | null;
  latencySeries24h: LatencyPointView[];
  dayBuckets: DayBucketView[];
  incidents24h: number;
}
