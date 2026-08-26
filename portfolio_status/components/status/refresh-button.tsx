"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const refresh = useCallback(async () => {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/refresh", { method: "POST" });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const retryAfter = Number(body?.retryAfterSeconds ?? response.headers.get("retry-after"));
        setCooldown(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter) : 60);
        setError(typeof body?.error === "string" ? body.error : "Refresh failed.");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setPending(false);
    }
  }, [router]);

  const busy = pending || isRefreshing;
  const disabled = busy || cooldown > 0;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={refresh}
        disabled={disabled}
        title={error ?? "Run a health check for every service now"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors",
          disabled ? "cursor-not-allowed opacity-60" : "hover:text-ink",
        )}
      >
        <RotateCw size={13} className={cn(busy && "animate-spin")} />
        {busy ? "Checking…" : cooldown > 0 ? `Retry in ${cooldown}s` : "Refresh"}
      </button>
      {error ? <p className="max-w-[220px] text-right text-[11px] text-status-warning">{error}</p> : null}
    </div>
  );
}
