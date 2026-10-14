// Run: node lib/latency-history.check.mjs
import assert from "node:assert/strict";
import { buildLatencyHistory } from "./statusAggregate.ts";

const HOUR = 60 * 60 * 1000;
const now = new Date(Date.UTC(2026, 9, 14, 12, 30));
const at = (hoursAgo) => new Date(now.getTime() - hoursAgo * HOUR);

const history = buildLatencyHistory(
  [
    {
      id: "a",
      name: "Fast",
      checks: [
        { status: "up", latencyMs: 100, checkedAt: at(0) },
        { status: "up", latencyMs: 300, checkedAt: at(0.2) },
        { status: "down", latencyMs: 9000, checkedAt: at(5) },
        { status: "up", latencyMs: 999, checkedAt: at(48) }, // outside 24h, inside 7d
      ],
    },
    { id: "b", name: "Slow", checks: [{ status: "up", latencyMs: 500, checkedAt: at(0.4) }] },
    { id: "c", name: "Empty", checks: [] },
  ],
  now,
);

const day = history["24h"];
assert.equal(day.buckets.length, 24);
const last = day.buckets.at(-1);
assert.equal(last.start, Date.UTC(2026, 9, 14, 12));
assert.deepEqual([last.avgMs, last.minMs, last.maxMs, last.checks], [300, 100, 500, 3]);

// The failed check counts as a failure but not as a latency reading.
const failed = day.buckets.find((b) => b.failures > 0);
assert.deepEqual([failed.checks, failed.avgMs], [1, null]);
assert.deepEqual([day.checks, day.failures, day.avgMs, day.peakMs, day.p95Ms], [4, 1, 300, 500, 500]);

// Slowest service first, no-data last.
assert.deepEqual(day.services.map((s) => s.name), ["Slow", "Fast", "Empty"]);

assert.equal(history["7d"].checks, 5);
assert.equal(history["30d"].buckets.length, 30);

console.log("latency-history: ok");
