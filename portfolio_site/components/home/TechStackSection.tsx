"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Container } from "@/components/layout/Container";
import { PixelCat } from "@/components/ui/PixelCat";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { StackIcon } from "@/components/stack/StackIcon";
import { stackCategories } from "@/lib/stack";
import type { StackCategory } from "@/lib/stack";

const frontend = stackCategories.find((c) => c.id === "frontend")!;
const backend = stackCategories.find((c) => c.id === "backend")!;
const database = stackCategories.find((c) => c.id === "database")!;
const devops = stackCategories.find((c) => c.id === "devops")!;

function StackNode({
  category,
  nodeRef,
}: {
  category: StackCategory;
  nodeRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={nodeRef}
      className="relative flex w-full flex-col gap-4 border border-outline-variant bg-background p-5 md:w-60"
    >
      <div>
        <h3 className="font-code-label text-secondary">{category.label}</h3>
        <p className="mt-1.5 font-body-md text-xs text-muted-foreground">
          {category.description}
        </p>
      </div>
      <ul className="mt-auto flex flex-wrap gap-2">
        {category.items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-1.5 border border-outline-variant/60 px-2 py-1 font-code-label text-[11px] text-foreground"
          >
            <StackIcon id={item.icon} className="size-3.5" />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Just the static rail — the traveling light lives in one shared overlay
 * (`SnakeTrail`) that spans the whole diagram, not per-connector. */
function DataConnector() {
  return (
    <div className="relative flex h-10 w-full shrink-0 items-center justify-center self-center md:w-12 lg:w-16">
      <div className="absolute inset-0 m-auto h-full w-px bg-outline-variant md:h-px md:w-full" />
    </div>
  );
}

type Rect = { left: number; top: number; right: number; bottom: number; cx: number; cy: number };

function measureRelativeTo(container: DOMRect, el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  const left = r.left - container.left;
  const top = r.top - container.top;
  return {
    left,
    top,
    right: left + r.width,
    bottom: top + r.height,
    cx: left + r.width / 2,
    cy: top + r.height / 2,
  };
}

/** Builds the one continuous route the snake travels: Frontend's door (its
 * single point of origin) around all four sides of its own border — twice —
 * back to that same point, across the connector to Backend, twice around
 * Backend's border from its near door, then on to its far door, across the
 * next connector, and twice around Database's border back to its own door
 * (the end point). Each stop is fully circled before the route moves on, so
 * nothing is skipped past on the way through. Whether the flow reads
 * left-to-right or top-to-bottom is read straight off the measured boxes
 * (same row vs. stacked) rather than assumed from the viewport width, so it
 * can't drift out of sync with the actual CSS breakpoint. */
function buildPath(container: DOMRect, f: HTMLElement, b: HTMLElement, d: HTMLElement) {
  const F = measureRelativeTo(container, f);
  const B = measureRelativeTo(container, b);
  const D = measureRelativeTo(container, d);
  const isRow = Math.abs(F.top - B.top) < 8;

  if (isRow) {
    const loopF = `L ${F.right} ${F.top} L ${F.left} ${F.top} L ${F.left} ${F.bottom} L ${F.right} ${F.bottom} L ${F.right} ${F.cy}`;
    const loopBFromLeft = `L ${B.left} ${B.top} L ${B.right} ${B.top} L ${B.right} ${B.bottom} L ${B.left} ${B.bottom} L ${B.left} ${B.cy}`;
    const toBRight = `L ${B.left} ${B.top} L ${B.right} ${B.top} L ${B.right} ${B.cy}`;
    const loopD = `L ${D.left} ${D.top} L ${D.right} ${D.top} L ${D.right} ${D.bottom} L ${D.left} ${D.bottom} L ${D.left} ${D.cy}`;
    return [
      `M ${F.right} ${F.cy}`,
      loopF,
      loopF,
      `L ${B.left} ${B.cy}`,
      loopBFromLeft,
      loopBFromLeft,
      toBRight,
      `L ${D.left} ${D.cy}`,
      loopD,
      loopD,
    ].join(" ");
  }

  const loopF = `L ${F.left} ${F.bottom} L ${F.left} ${F.top} L ${F.right} ${F.top} L ${F.right} ${F.bottom} L ${F.cx} ${F.bottom}`;
  const loopBFromTop = `L ${B.left} ${B.top} L ${B.left} ${B.bottom} L ${B.right} ${B.bottom} L ${B.right} ${B.top} L ${B.cx} ${B.top}`;
  const toBBottom = `L ${B.left} ${B.top} L ${B.left} ${B.bottom} L ${B.cx} ${B.bottom}`;
  const loopD = `L ${D.left} ${D.top} L ${D.left} ${D.bottom} L ${D.right} ${D.bottom} L ${D.right} ${D.top} L ${D.cx} ${D.top}`;
  return [
    `M ${F.cx} ${F.bottom}`,
    loopF,
    loopF,
    `L ${B.cx} ${B.top}`,
    loopBFromTop,
    loopBFromTop,
    toBBottom,
    `L ${D.cx} ${D.top}`,
    loopD,
    loopD,
  ].join(" ");
}

type SnakeBox = {
  d: string;
  width: number;
  height: number;
  totalLen: number;
  dash: number;
};

/** Real length in SVG user units of a path string — independent of the
 * `pathLength` normalization trick used for the dash animation below, which
 * only affects dash math, not `getTotalLength`/`getPointAtLength`. Built on
 * a detached element (never attached to the DOM) purely for its geometry. */
function measurePathLength(d: string) {
  const temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
  temp.setAttribute("d", d);
  return temp.getTotalLength();
}

/** A single light traveling the route above and back — classic Snake, not a
 * per-block state machine. One continuous `path`, a dash (the body) sliding
 * along it via `stroke-dashoffset`, and a small lit dot riding at its front:
 * wherever the body isn't, there's no stroke at all, so the trail is simply
 * never drawn behind it rather than needing to be separately erased.
 * `repeatType: "mirror"` makes it retrace the same path back to the start
 * once it reaches Database, forever. The body's length is computed from the
 * route's real geometry — one full node perimeter, plus a little — so it
 * always reads as "wraps an entire block at once" regardless of how big the
 * boxes actually render. */
function SnakeTrail({
  containerRef,
  frontendRef,
  backendRef,
  databaseRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  frontendRef: React.RefObject<HTMLDivElement | null>;
  backendRef: React.RefObject<HTMLDivElement | null>;
  databaseRef: React.RefObject<HTMLDivElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [box, setBox] = useState<SnakeBox | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);
  const headX = useMotionValue(0);
  const headY = useMotionValue(0);
  // Trailing, not centered: a centered dash wastes half its length pointing
  // backward into whatever the snake just left, so a freshly-entered block
  // only gets illuminated by the other half — not enough to reliably cover
  // all four sides. Trailing means the full length lights up what's behind
  // the current point.
  const dashOffset = useTransform(progress, (t) => -t);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const f = frontendRef.current;
      const b = backendRef.current;
      const d = databaseRef.current;
      if (!container || !f || !b || !d) return;

      const containerRect = container.getBoundingClientRect();
      const dAttr = buildPath(containerRect, f, b, d);
      const totalLen = measurePathLength(dAttr);
      const perimeter = 2 * (f.offsetWidth + f.offsetHeight);
      const dash = Math.min(0.4, Math.max(0.08, (perimeter * 1.25) / totalLen));

      setBox({ d: dAttr, width: containerRect.width, height: containerRect.height, totalLen, dash });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, frontendRef, backendRef, databaseRef]);

  // Deliberately decoupled from `box`/geometry: a resize (or the couple of
  // legitimate reflows web fonts cause right after mount) must never reset
  // this timer, or the snake would keep snapping back near the door instead
  // of ever reaching the far side of a loop.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const controls = animate(progress, 1, {
      duration: 11,
      ease: "linear",
      repeat: Infinity,
      repeatType: "mirror",
    });

    // Pauses (not stops — `.stop()` would forget the current position) the
    // infinite loop, and the per-frame `getPointAtLength` DOM work it
    // drives via the subscription below, whenever the diagram has scrolled
    // out of view. Resumes from wherever it left off.
    const container = containerRef.current;
    const io = container
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) controls.play();
            else controls.pause();
          },
          { threshold: 0 }
        )
      : null;
    if (container && io) io.observe(container);

    return () => {
      controls.stop();
      io?.disconnect();
    };
  }, [prefersReducedMotion, progress, containerRef]);

  useMotionValueEvent(progress, "change", (t) => {
    if (!pathRef.current || !box) return;
    const pt = pathRef.current.getPointAtLength(t * box.totalLen);
    headX.set(pt.x);
    headY.set(pt.y);
  });

  if (!box || prefersReducedMotion) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0"
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
    >
      <motion.path
        ref={pathRef}
        d={box.d}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${box.dash} 1`}
        style={{ strokeDashoffset: dashOffset, filter: "drop-shadow(0 0 4px var(--primary))" }}
      />
      <motion.circle
        cx={headX}
        cy={headY}
        r={4.5}
        fill="var(--primary)"
        style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
      />
    </svg>
  );
}

export function TechStackSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frontendRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const databaseRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="stack"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      <Container>
        <SectionKicker index="03" label="TECH STACK" />
        <h2 className="max-w-2xl font-headline-lg text-foreground">
          Tools I reach for, and why they earn a place in the stack.
        </h2>

        <div className="relative mt-(--spacing-stack-md)">
          <PixelCat size={6} delay={2.4} className="-top-13 right-10" text="Damn, that's a lot of tech!" />

          <div className="border border-outline-variant bg-background p-6 md:p-8">
            {/* Frontend -> Backend -> Database, traced by a single traveling
            light that runs the route and back, like Snake. */}
            <div ref={containerRef} className="relative flex flex-col items-center gap-0 md:flex-row md:items-stretch md:justify-center">
              <StackNode category={frontend} nodeRef={frontendRef} />
              <DataConnector />
              <StackNode category={backend} nodeRef={backendRef} />
              <DataConnector />
              <StackNode category={database} nodeRef={databaseRef} />
              {/* Rendered last so it paints on top of the nodes' opaque
              backgrounds — an overlay drawn before its siblings gets
              painted over by them, which is why the top/bottom edges (fully
              inside each box) were disappearing while the left/right edges
              (bleeding into the transparent connector gaps) stayed visible. */}
              <SnakeTrail
                containerRef={containerRef}
                frontendRef={frontendRef}
                backendRef={backendRef}
                databaseRef={databaseRef}
              />
            </div>

            {/* Tools & DevOps: the layer underneath everything above */}
            <div className="mt-10 border-t border-dashed border-outline-variant pt-6">
              <div className="flex items-center gap-3">
                <span className="font-code-label text-[11px] text-secondary">
                  {devops.label.toUpperCase()}
                </span>
                <span className="h-px flex-1 bg-outline-variant" aria-hidden />
                <span className="font-code-label text-[10px] text-muted-foreground">
                  used across every layer above
                </span>
              </div>
              <p className="mt-2 max-w-xl font-body-md text-xs text-muted-foreground">
                {devops.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {devops.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center gap-1.5 border border-outline-variant/60 px-2 py-1 font-code-label text-[11px] text-foreground"
                  >
                    <StackIcon id={item.icon} className="size-3.5" />
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
