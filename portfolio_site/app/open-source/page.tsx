"use client";
import { Container } from "@/components/layout/Container";
import CounterReactBits from "@/components/ReactBits/Counter";
import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { OpenSourceTimeline } from "@/components/open-source/OpenSourceTimeline";
import { CommitHighlights } from "@/components/open-source/CommitHighlights";

export default function OpenSourcePage() {
  const [counterValue, setCounterValue] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCounterValue(293);
  }, []);

  return (
    <>
      <Container>
        {/* ── Hero ── */}
        <h1 className="font-headline-lg text-foreground">Open Source</h1>

        {/* programme badges */}
        <div className="flex flex-wrap gap-3 mt-5">
          {/* GSoC badge */}
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wide"
            style={{
              background: "color-mix(in srgb, #4285F4 15%, #03120e)",
              border: "1px solid #4285F444",
              color: "#4285F4",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#4285F4" }}
            />
            Google Summer of Code 2025 — Contributor
          </span>

          {/* Hacktoberfest badge */}
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wide"
            style={{
              background: "color-mix(in srgb, #ff6b35 15%, #03120e)",
              border: "1px solid #ff6b3544",
              color: "#ff6b35",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#ff6b35" }}
            />
            Hacktoberfest 2025 — Completed
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-muted-foreground">
          I participated in{" "}
          <span className="text-[#4285F4] font-medium">
            Google Summer of Code 2025
          </span>{" "}
          as an open-source contributor, implementing real features merged into
          upstream. In parallel, I completed{" "}
          <span className="text-[#ff6b35] font-medium">Hacktoberfest 2025</span>{" "}
          with 4 quality PRs merged across the JavaScript and TypeScript ecosystem.
          My focus is on type-safety, performance, and maintainability — whether
          navigating large codebases, triaging issues, or improving developer
          tooling.
        </p>

        {/* ── GitHub heatmap ── */}
        <div className="mt-10">
          {isMounted && (
            <GitHubCalendar
              maxLevel={3}
              username="varadisthedev"
            />
          )}
        </div>

        {/* ── Commit highlights ── */}
        <CommitHighlights />

        {/* ── Slider timeline ── */}
        <OpenSourceTimeline />

        {/* ── Legacy upcoming section (renamed) ── */}
        <section className="mt-14 mb-8">
          <h3 className="font-headline-md text-foreground">
            What&apos;s Next
          </h3>
          <div className="mt-3 prose text-muted-foreground">
            <ul>
              <li>
                Continuing upstream contributions from GSoC — bug fixes and
                follow-up features post-programme.
              </li>
              <li>
                Exploring maintainer roles in smaller JS/TS libraries to deepen
                review and triage skills.
              </li>
            </ul>
          </div>
        </section>
      </Container>
    </>
  );
}