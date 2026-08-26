"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";

const REFRESH_INTERVAL_MS = 60_000;

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
 * component last mounted — and pulls fresh server data on an interval.
 */
export function AutoRefresh({ lastCheckedAt, isStale }: { lastCheckedAt: string | null; isStale: boolean }) {
  const router = useRouter();
  const isClient = useIsClient();
  const [age, setAge] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setAge(lastCheckedAt ? formatAge(Date.now() - new Date(lastCheckedAt).getTime()) : null);
    };

    tick();
    const tickTimer = setInterval(tick, 1000);
    const refreshTimer = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(tickTimer);
      clearInterval(refreshTimer);
    };
  }, [lastCheckedAt, router]);

  const dotClass = isStale || !lastCheckedAt ? "bg-status-warning" : "bg-status-good";

  return (
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
  );
}
