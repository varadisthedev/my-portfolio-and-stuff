"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { LatencyPointView } from "@/lib/types";

const PALETTE = {
  light: { accent: "#2a78d6", fill: "#cde2fb", grid: "#e1e0d9", muted: "#898781", surface: "#fcfcfb", ink: "#0b0b0b" },
  dark: { accent: "#3987e5", fill: "#0d366b", grid: "#2c2c2a", muted: "#898781", surface: "#1a1a19", ink: "#ffffff" },
};

function formatTime(t: number) {
  return new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function CustomTooltip({
  active,
  payload,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ value: number | null; payload: LatencyPointView }>;
  colors: typeof PALETTE.light;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div
      className="rounded-lg border px-2.5 py-1.5 text-xs shadow-sm"
      style={{ background: colors.surface, borderColor: colors.grid, color: colors.ink }}
    >
      <p className="font-medium">{point.latencyMs != null ? `${point.latencyMs} ms` : "No response"}</p>
      <p style={{ color: colors.muted }}>{formatTime(point.t)}</p>
    </div>
  );
}

export function LatencyChart({ data }: { data: LatencyPointView[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const colors = PALETTE[mounted && resolvedTheme === "dark" ? "dark" : "light"];

  if (data.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-ink-muted">
        No latency data yet
      </div>
    );
  }

  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.grid} strokeWidth={1} />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTime}
            tick={{ fontSize: 10, fill: colors.muted }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <Tooltip content={<CustomTooltip colors={colors} />} />
          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke={colors.accent}
            strokeWidth={2}
            fill="url(#latencyFill)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
