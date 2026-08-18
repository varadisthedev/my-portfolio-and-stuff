"use client";

import { useState, useSyncExternalStore } from "react";
import { RefreshCw } from "lucide-react";
import { GitHubCalendar } from "react-github-calendar";
import { CountUp } from "@/components/ReactBits/CountUp";
import { Container } from "@/components/layout/Container";
import { PixelCat } from "@/components/ui/PixelCat";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { cn } from "@/lib/utils";
import type { GithubStatsResult } from "@/lib/githubStats";

const noopSubscribe = () => () => { };

/** GitHubCalendar fetches client-side and isn't SSR-safe, so it can only
 * render once hydrated. `useSyncExternalStore` reports `false` for the
 * server render and the initial client render (avoiding a hydration
 * mismatch), then `true` once React re-renders post-hydration — without
 * the extra render-and-setState-in-an-effect round trip. */
function useHasMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

type OpenSourceSectionProps = {
  stats: GithubStatsResult | null;
};

export function OpenSourceSection({ stats: initialStats }: OpenSourceSectionProps) {
  const mounted = useHasMounted();
  const [stats, setStats] = useState(initialStats);
  const [replayToken, setReplayToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/github-stats", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as GithubStatsResult;
        setStats(fresh);
      }
    } catch {
      // No connectivity or the endpoint errored — just replay whatever
      // numbers are already on screen instead of leaving the button stuck.
    } finally {
      setReplayToken((token) => token + 1);
      setRefreshing(false);
    }
  };

  return (
    <section
      id="open-source"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      <Container>
        <SectionKicker index="03" label="OPEN SOURCE" />
        <h2 className="max-w-2xl font-headline-lg text-foreground">
          Most of this happens in public.
        </h2>
        <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
          I keep almost everything I build in public repositories — the
          production apps above, hackathon entries, and the smaller
          experiments that never became anything. This is what that looks
          like day to day.
        </p>

        <div className="relative mt-(--spacing-stack-md) grid grid-cols-1 gap-8 border border-outline-variant bg-background p-6 md:grid-cols-[1fr_auto] md:items-center">
          {/* Perched on the top border, like it wandered onto the ledge —
          bottom edge of the sprite lands right on the border line. */}
          <PixelCat size={6} delay={2.4} className="-top-10 right-8" text="no filler DSA commits btw" catColor="#645d5d" catEyeColor="#080606" catOutlineColor="#292829" />

          <div className="overflow-x-auto">
            {mounted ? (
              <GitHubCalendar
                maxLevel={3}
                username="varadisthedev"
                colorScheme="dark"
                theme={{
                  // 2 colors (zero + max) so the library auto-interpolates a
                  // scale — the explicit per-level array form turned out to
                  // require a different exact count for light vs dark here,
                  // which isn't worth chasing for an unused light theme.
                  light: ["#ebedf0", "#30a14e"],
                  dark: ["#161b1a", "#39d353"],
                }}
              />
            ) : null}
          </div>

          {stats ? (
            <div className="relative flex shrink-0 flex-col gap-6 border-outline-variant pt-6 md:border-l md:pt-0 md:pl-10">
              <button
                type="button"
                onClick={handleRefresh}
                aria-label="Refresh repository and line counts"
                className="absolute top-0 right-0 p-1.5 text-muted-foreground transition-colors hover:text-primary md:top-0 md:right-0"
              >
                <RefreshCw
                  className={cn("size-3.5", refreshing && "animate-spin")}
                />
              </button>

              <div>
                <CountUp
                  value={stats.repoCount}
                  replayToken={replayToken}
                  className="font-headline-md text-primary"
                />
                <p className="mt-1 font-code-label text-[11px] text-muted-foreground">
                  Repositories
                </p>
              </div>
              <div>
                <CountUp
                  value={stats.loc}
                  duration={1.8}
                  replayToken={replayToken}
                  className="font-headline-md text-primary"
                />
                <p className="mt-1 font-code-label text-[11px] text-muted-foreground">
                  Lines written
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
