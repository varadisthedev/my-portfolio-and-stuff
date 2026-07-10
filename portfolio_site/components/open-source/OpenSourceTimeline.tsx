"use client";
import { useRef, useState } from "react";

type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  title: string;
  description: string;
  tag: "GSoC" | "Hacktoberfest";
  color: string;
  icon: string;
};

const events: TimelineEvent[] = [
  {
    id: "gsoc-accepted",
    date: "Apr 2025",
    label: "GSoC 2025",
    title: "Accepted into Google Summer of Code",
    description:
      "Selected as a contributor for GSoC 2025. Began community bonding with the open-source org, studying the codebase and aligning on project goals.",
    tag: "GSoC",
    color: "#4285F4",
    icon: "G",
  },
  {
    id: "gsoc-coding-start",
    date: "May 2025",
    label: "GSoC 2025",
    title: "Coding Period Begins",
    description:
      "Started implementing the proposed features. Pushed first significant commits and opened initial PRs for mentor review.",
    tag: "GSoC",
    color: "#4285F4",
    icon: "G",
  },
  {
    id: "gsoc-midterm",
    date: "Jul 2025",
    label: "GSoC 2025",
    title: "Midterm Evaluation — Passed",
    description:
      "Successfully passed the midterm evaluation. Core feature set merged; pivoted to performance improvements and documentation.",
    tag: "GSoC",
    color: "#4285F4",
    icon: "G",
  },
  {
    id: "gsoc-final",
    date: "Sep 2025",
    label: "GSoC 2025",
    title: "Final Submission",
    description:
      "Delivered the final work product. All target PRs merged, written up the work report, and received a successful final evaluation.",
    tag: "GSoC",
    color: "#4285F4",
    icon: "G",
  },
  {
    id: "hacktober-start",
    date: "Oct 2025",
    label: "Hacktoberfest",
    title: "Hacktoberfest 2025 Kicks Off",
    description:
      "Registered for Hacktoberfest 2025. Started hunting quality issues across JavaScript and TypeScript repos to contribute to.",
    tag: "Hacktoberfest",
    color: "#ff6b35",
    icon: "H",
  },
  {
    id: "hacktober-pr1",
    date: "Oct 2025",
    label: "Hacktoberfest",
    title: "PRs #1 & #2 Merged",
    description:
      "First two quality pull requests merged — fixed a type-safety bug and improved documentation in a popular OSS library.",
    tag: "Hacktoberfest",
    color: "#ff6b35",
    icon: "H",
  },
  {
    id: "hacktober-pr2",
    date: "Oct 2025",
    label: "Hacktoberfest",
    title: "PRs #3 & #4 Merged",
    description:
      "Completed the 4-PR milestone for Hacktoberfest. Contributed performance patches and accessibility improvements to two separate projects.",
    tag: "Hacktoberfest",
    color: "#ff6b35",
    icon: "H",
  },
  {
    id: "hacktober-complete",
    date: "Nov 2025",
    label: "Hacktoberfest",
    title: "Hacktoberfest Completed 🎉",
    description:
      "All contributions validated. Earned the Hacktoberfest 2025 badge and planted a tree through the program's digital-forest initiative.",
    tag: "Hacktoberfest",
    color: "#ff6b35",
    icon: "H",
  },
];

export function OpenSourceTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  /* ── drag-to-scroll ── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(false);
    dragStart.current = { x: e.clientX, scrollLeft: trackRef.current.scrollLeft };
    const onMove = (ev: MouseEvent) => {
      if (!trackRef.current) return;
      const dx = ev.clientX - dragStart.current.x;
      if (Math.abs(dx) > 4) setIsDragging(true);
      trackRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const scrollTo = (idx: number) => {
    setActiveIdx(idx);
    if (!trackRef.current) return;
    const card = trackRef.current.children[idx] as HTMLElement;
    if (!card) return;
    trackRef.current.scrollTo({ left: card.offsetLeft - 32, behavior: "smooth" });
  };

  return (
    <section className="mt-16">
      {/* header */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="inline-block w-2 h-2 rounded-full animate-pulse"
          style={{ background: "#c0c1ff", boxShadow: "0 0 6px #c0c1ffaa" }}
        />
        <h2 className="font-headline-md text-foreground">Open-Source Journey</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-8 max-w-xl">
        A chronological look at my GSoC 2025 and Hacktoberfest 2025 milestones — drag or click to explore.
      </p>

      {/* ── connector rail ── */}
      <div className="relative mb-0">
        {/* horizontal rail line */}
        <div
          className="absolute top-[18px] left-0 right-0 h-[2px] rounded-full z-0"
          style={{
            background: "linear-gradient(90deg, #03120e 0%, #0d4a1e 40%, #1a6b2e 70%, #03120e 100%)",
            boxShadow: "0 0 8px #0d4a1e66",
          }}
        />
        {/* dot indicators */}
        <div
          className="relative z-10 flex justify-between px-0"
          style={{ overflowX: "hidden" }}
        >
          {events.map((ev, i) => (
            <button
              key={ev.id}
              onClick={() => scrollTo(i)}
              title={ev.title}
              className="flex flex-col items-center gap-1 group"
              style={{ minWidth: 0 }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: activeIdx === i
                    ? ev.color
                    : "color-mix(in srgb, #03120e 70%, transparent)",
                  border: `2px solid ${activeIdx === i ? ev.color : "#1a6b2e44"}`,
                  boxShadow: activeIdx === i ? `0 0 16px ${ev.color}88` : "none",
                  color: activeIdx === i ? "#fff" : "#c7c4d7",
                  transform: activeIdx === i ? "scale(1.2)" : "scale(1)",
                }}
              >
                {ev.icon}
              </span>
              <span
                className="text-[9px] font-mono hidden sm:block transition-colors duration-200"
                style={{ color: activeIdx === i ? ev.color : "#464554" }}
              >
                {ev.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── scrollable cards track ── */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        className="flex gap-4 mt-6 overflow-x-auto pb-4 select-none"
        style={{
          scrollbarWidth: "none",
          cursor: isDragging ? "grabbing" : "grab",
          scrollSnapType: "x mandatory",
        }}
      >
        {events.map((ev, i) => (
          <div
            key={ev.id}
            onClick={() => !isDragging && setActiveIdx(i)}
            className="flex-none rounded-xl p-5 transition-all duration-300"
            style={{
              width: "min(320px, 80vw)",
              scrollSnapAlign: "start",
              background:
                activeIdx === i
                  ? `linear-gradient(135deg, #03120e 0%, color-mix(in srgb, ${ev.color} 15%, #03120e) 100%)`
                  : "#1c1b1b",
              border: `1px solid ${activeIdx === i ? ev.color + "55" : "#464554"}`,
              boxShadow: activeIdx === i ? `0 4px 32px ${ev.color}22` : "none",
              cursor: "pointer",
            }}
          >
            {/* tag pill */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-widest"
                style={{
                  background: `color-mix(in srgb, ${ev.color} 20%, transparent)`,
                  color: ev.color,
                  border: `1px solid ${ev.color}44`,
                }}
              >
                {ev.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{ev.date}</span>
            </div>

            <h3
              className="font-semibold text-sm mb-2 leading-snug"
              style={{ color: activeIdx === i ? "#e5e2e1" : "#c7c4d7" }}
            >
              {ev.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
          </div>
        ))}
      </div>

      {/* ── pagination dots ── */}
      <div className="flex justify-center gap-2 mt-4">
        {events.map((ev, i) => (
          <button
            key={ev.id}
            onClick={() => scrollTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: activeIdx === i ? "20px" : "6px",
              height: "6px",
              background: activeIdx === i ? ev.color : "#464554",
            }}
          />
        ))}
      </div>
    </section>
  );
}
