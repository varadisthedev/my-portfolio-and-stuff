import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">404</p>
        <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
        <p className="text-sm text-ink-secondary">There&apos;s nothing at this address.</p>
        <Link
          href="/"
          className="mt-2 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          Back to status page
        </Link>
      </div>
    </main>
  );
}
