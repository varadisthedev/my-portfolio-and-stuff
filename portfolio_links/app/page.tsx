import Link from "next/link";
import { Lock } from "lucide-react";
import connectToMongo from "@/lib/db/connect";
import LinkModel from "@/lib/db/models/Link";
import { ClockPills } from "@/components/links/ClockPills";
import { LinkRow } from "@/components/links/LinkRow";

export default async function HomePage() {
  await connectToMongo();
  const links = await LinkModel.find().sort({ order: 1 }).lean();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between gap-8 px-4 py-8 sm:py-14">
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-bg-panel shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <ClockPills initial={new Date().toISOString()} />
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-border-bright" />
            <span className="h-2 w-2 rounded-full bg-border-bright" />
            <span className="h-2 w-2 rounded-full bg-accent-dim" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-bright bg-surface text-lg font-semibold text-accent text-glow">
            VR
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-text text-glow">VARAD RAUT</h1>
            <p className="text-xs text-text-dim">@varadisthedev</p>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-text-dim">
            <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-accent" />
            Open to opportunities
          </p>
        </div>
      </div>

      <section className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs tracking-widest text-text-dim">links . . .</h2>
          <Link
            href="/login"
            aria-label="Admin login"
            className="text-text-faint transition-colors hover:text-text-dim"
          >
            <Lock size={13} />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {links.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-text-faint">
              No links yet.
            </p>
          ) : (
            links.map((link, i) => (
              <LinkRow
                key={link._id.toString()}
                index={i + 1}
                platform={link.platform}
                label={link.label}
                url={link.url}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
