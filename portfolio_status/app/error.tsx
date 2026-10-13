"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Error</p>
        <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
        <p className="text-sm text-ink-secondary">The status page couldn&apos;t load right now. Try again in a moment.</p>
        {error.digest ? <p className="font-mono text-[11px] text-ink-muted">Ref: {error.digest}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            <RotateCw size={13} />
            Try again
          </button>
          <Link href="/" className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
