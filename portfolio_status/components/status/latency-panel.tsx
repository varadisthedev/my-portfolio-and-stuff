"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";
import type { LatencyBucket, LatencyHistory, LatencyRange } from "@/lib/types";

const RANGES: LatencyRange[] = ["24h", "7d", "30d"];

/** Light: neutral ink on white, smooth curve. Dark: one electric line, straight segments, square markers. */
const PALETTE = {
  light: { line: "#171717", grid: "#ececea", axis: "#8f8e89", avg: "#b5b4ae", cursor: "#d4d3cd", curve: "monotone", dash: undefined },
  dark: { line: "#5cb8ff", grid: "#262624", axis: "#7a7974", avg: "#3d3d3a", cursor: "#5cb8ff", curve: "linear", dash: "2 3" },
} as const;

type Colors = (typeof PALETTE)[keyof typeof PALETTE];

function formatMs(value: number | null) {
  return value == null ? "—" : `${value} ms`;
}

function formatAxisMs(v: number) {
  return v >= 1000 ? `${+(v / 1000).toFixed(1)}s` : `${v}ms`;
}

function formatTick(t: number, range: LatencyRange) {
  const date = new Date(t);
  return range === "24h"
    ? date.toLocaleTimeString(undefined, { hour: "numeric" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatBucket(bucket: LatencyBucket, range: LatencyRange) {
  const start = new Date(bucket.start);
  const day = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  if (range === "30d") return day;
  const time = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day}, ${time(bucket.start)} – ${time(bucket.end)}`;
}

function BucketTooltip({
  active,
  payload,
  range,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ payload: LatencyBucket }>;
  range: LatencyRange;
  colors: Colors;
}) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;

  return (
    <div className="latency-tip min-w-44 border border-hairline bg-surface px-3 py-2.5 text-xs shadow-lg">
      <p className="text-ink-muted">{formatBucket(bucket, range)}</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <span className="inline-block size-2" style={{ background: colors.line }} />
          Avg latency
        </span>
        <span className="font-semibold tabular-nums text-ink">{formatMs(bucket.avgMs)}</span>
      </div>
      <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 tabular-nums">
        <dt className="text-ink-muted">Fastest</dt>
        <dd className="text-right text-ink-secondary">{formatMs(bucket.minMs)}</dd>
        <dt className="text-ink-muted">Slowest</dt>
        <dd className="text-right text-ink-secondary">{formatMs(bucket.maxMs)}</dd>
        <dt className="text-ink-muted">Checks</dt>
        <dd className="text-right text-ink-secondary">
          {bucket.checks}
          {bucket.failures > 0 ? <span className="text-status-critical"> · {bucket.failures} failed</span> : null}
        </dd>
      </dl>
    </div>
  );
}

export function LatencyPanel({ history }: { history: LatencyHistory }) {
  const [range, setRange] = useState<LatencyRange>("24h");
  const { resolvedTheme } = useTheme();
  const isClient = useIsClient();
  const dark = isClient && resolvedTheme === "dark";
  const colors = dark ? PALETTE.dark : PALETTE.light;

  const view = history[range];
  const slowest = view.services[0]?.avgMs ?? 0;
  // A bucket with empty neighbours has no segment to draw, so it gets a marker instead.
  const isolated = (i: number) =>
    view.buckets[i]?.avgMs != null && view.buckets[i - 1]?.avgMs == null && view.buckets[i + 1]?.avgMs == null;

  return (
    <section aria-label="Average latency" className="latency-panel border border-hairline p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Avg latency</p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {view.avgMs ?? "—"}
            {view.avgMs != null ? <span className="ml-1 text-base font-medium text-ink-muted">ms</span> : null}
          </p>
        </div>
        <div className="latency-tip inline-flex border border-hairline p-0.5" role="group" aria-label="Time range">
          {RANGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={cn(
                "latency-tip px-2.5 py-1 text-xs font-medium tabular-nums transition-colors",
                range === option ? "bg-ink text-page" : "text-ink-secondary hover:text-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs tabular-nums">
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">p95</dt>
          <dd className="font-medium text-ink-secondary">{formatMs(view.p95Ms)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">Peak</dt>
          <dd className="font-medium text-ink-secondary">{formatMs(view.peakMs)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">Checks</dt>
          <dd className="font-medium text-ink-secondary">
            {view.checks}
            {view.failures > 0 ? <span className="text-status-critical"> ({view.failures} failed)</span> : null}
          </dd>
        </div>
      </dl>

      <div className="mt-4 h-[220px]">
        {view.avgMs == null ? (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            No successful checks in the last {range}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={view.buckets} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="latencyPanelFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.line} stopOpacity={dark ? 0.22 : 0.1} />
                  <stop offset="100%" stopColor={colors.line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray={colors.dash} />
              <XAxis
                dataKey="start"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t: number) => formatTick(t, range)}
                tick={{ fontSize: 10, fill: colors.axis }}
                axisLine={false}
                tickLine={false}
                minTickGap={36}
              />
              <YAxis
                width={40}
                tickCount={4}
                domain={[0, "auto"]}
                tickFormatter={formatAxisMs}
                tick={{ fontSize: 10, fill: colors.axis }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={view.avgMs} stroke={colors.avg} strokeDasharray="4 4" />
              <Tooltip
                content={<BucketTooltip range={range} colors={colors} />}
                cursor={{ stroke: colors.cursor, strokeWidth: 1, strokeDasharray: colors.dash }}
              />
              <Area
                type={colors.curve}
                dataKey="avgMs"
                stroke={colors.line}
                strokeWidth={dark ? 1.5 : 2}
                fill="url(#latencyPanelFill)"
                dot={({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) =>
                  index != null && cx != null && cy != null && isolated(index) ? (
                    dark ? (
                      <rect key={index} x={cx - 2.5} y={cy - 2.5} width={5} height={5} fill={colors.line} />
                    ) : (
                      <circle key={index} cx={cx} cy={cy} r={3} fill={colors.line} />
                    )
                  ) : (
                    <g key={index} />
                  )
                }
                activeDot={
                  dark
                    ? ({ cx, cy }: { cx?: number; cy?: number }) => (
                        <rect x={(cx ?? 0) - 3.5} y={(cy ?? 0) - 3.5} width={7} height={7} fill={colors.line} />
                      )
                    : { r: 4, fill: "#ffffff", stroke: colors.line, strokeWidth: 2 }
                }
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {view.services.length > 1 ? (
        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">By service</p>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {view.services.map((service) => (
              <li key={service.id} className="text-xs">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-ink-secondary">{service.name}</span>
                  <span className="shrink-0 font-medium tabular-nums text-ink">{formatMs(service.avgMs)}</span>
                </div>
                <div className="latency-tip mt-1 h-1 overflow-hidden bg-grid">
                  <div
                    className="latency-tip h-full"
                    style={{
                      width: slowest && service.avgMs != null ? `${(service.avgMs / slowest) * 100}%` : "0%",
                      background: colors.line,
                      opacity: dark ? 0.9 : 0.75,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-[11px] text-ink-muted">Successful checks only. Dashed line marks the {range} average.</p>
    </section>
  );
}
