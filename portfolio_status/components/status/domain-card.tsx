"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status/status-badge";
import { LatencyChart } from "@/components/status/latency-chart";
import { DayUptimeBar } from "@/components/status/day-uptime-bar";
import type { DomainView } from "@/lib/types";

function formatPct(value: number | null) {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.round(diffHour / 24)}d ago`;
}

export function DomainCard({ domain }: { domain: DomainView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-ink">{domain.name}</h3>
          <a
            href={domain.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs text-ink-muted hover:text-accent hover:underline break-all"
          >
            {domain.url}
          </a>
        </div>
        <StatusBadge status={domain.currentStatus} />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">Uptime — last 45 days</p>
        <DayUptimeBar buckets={domain.dayBuckets} />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-ink"
      >
        <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
        {expanded ? "Hide details" : "Show details"}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Latency</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">
                {domain.currentLatencyMs != null ? `${domain.currentLatencyMs} ms` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Uptime 24h</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">{formatPct(domain.uptime24h)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Uptime 7d</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">{formatPct(domain.uptime7d)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">Uptime 30d</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">{formatPct(domain.uptime30d)}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">Latency — last 24h</p>
            <LatencyChart data={domain.latencySeries24h} />
          </div>

          <p className="mt-4 text-[11px] text-ink-muted">
            Checked {formatRelativeTime(domain.lastCheckedAt)}
            {domain.incidents24h > 0
              ? ` · ${domain.incidents24h} incident${domain.incidents24h === 1 ? "" : "s"} in 24h`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
