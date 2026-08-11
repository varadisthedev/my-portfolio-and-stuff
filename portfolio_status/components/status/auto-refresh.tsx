"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 60_000;

export function AutoRefresh() {
  const router = useRouter();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      router.refresh();
      setSecondsAgo(0);
    }, REFRESH_INTERVAL_MS);

    const tickTimer = setInterval(() => setSecondsAgo((s) => s + 1), 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, [router]);

  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-muted">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-good" />
      </span>
      Live · refreshed {secondsAgo}s ago
    </p>
  );
}
