"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** GitHub's own dark-mode contribution-graph scale (levels 0–4) — reused
 * verbatim so this background and the real GitHubCalendar in
 * OpenSourceSection read as the same system, not a coincidence. */
const LEVELS = ["#0e4429", "#006d32", "#26a641", "#39d353"];

// How long a point in the cursor's wind trail stays visible before it's
// pruned, in milliseconds. Short enough that the trail reads as "following
// the cursor," not a lingering scribble.
const TRAIL_MAX_AGE_MS = 450;
const TRAIL_MAX_POINTS = 60;

// The grid stays at full density for the first `fadeStart` px of page
// scroll (≈ the hero's height, so it never visibly thins out while still
// inside the hero), then linearly fades over the next `fadeDistance` px
// down to `MIN_FADE` — never fully to zero, so it reads as "continuing,
// just quieter" rather than cutting off partway down the page.
const MIN_FADE = 0.1;

type Cell = { level: number; phase: number; speed: number };
type TrailPoint = { x: number; y: number; t: number };

type GithubGridBackgroundProps = {
  className?: string;
  cellSize?: number;
  gap?: number;
  /** Draws a wind/breeze streak that follows the pointer. */
  interactive?: boolean;
  /** Overall alpha multiplier on top of the scroll-depth fade — lets the
   * same component be a loud backdrop or a barely-there ambient texture. */
  intensity?: number;
  /** Fades the grid out with scroll depth, like it's continuing from the
   * hero and thinning out below it. Off for contexts that aren't full-page
   * (there's no "depth" to fade across). */
  fadeWithScroll?: boolean;
};

/** Sizes a canvas to its container (capped 2x DPR) only when the size
 * actually changed, and returns the CSS-pixel dimensions + DPR to draw
 * with. Shared by both canvases below so the sizing logic exists once. */
function syncCanvasSize(canvas: HTMLCanvasElement, container: HTMLElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width: w, height: h } = container.getBoundingClientRect();
  if (w === 0 || h === 0) return null;

  const pixelW = Math.floor(w * dpr);
  const pixelH = Math.floor(h * dpr);
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW;
    canvas.height = pixelH;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  return { w, h, dpr };
}

export function GithubGridBackground({
  className,
  cellSize = 14,
  gap = 5,
  interactive = false,
  intensity = 1,
  fadeWithScroll = false,
}: GithubGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Two canvases, not one: the grid only needs to repaint on a slow ambient
  // clock (or on resize/scroll), while the wind trail needs to repaint on
  // every pointer move. Splitting them means a fast-moving cursor redraws a
  // handful of line segments, not several thousand contribution cells —
  // the single-canvas version was repainting the whole grid on every
  // mousemove just to move a trail across it.
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const cellsRef = useRef<Cell[]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0 });
  const gridRafRef = useRef<number | null>(null);
  const trailRafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotionRef = useRef(false);
  const scrollYRef = useRef(0);
  const fadeParamsRef = useRef({ start: 800, distance: 900 });

  const buildCells = useCallback((count: number) => {
    const cells: Cell[] = new Array(count);
    for (let i = 0; i < count; i++) {
      // Sparse, like a real contribution graph: mostly quiet, a few lit.
      const roll = Math.random();
      const level = roll > 0.955 ? 3 : roll > 0.89 ? 2 : roll > 0.78 ? 1 : 0;
      cells[i] = {
        level,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.22,
      };
    }
    return cells;
  }, []);

  const drawGrid = useCallback(
    (time: number) => {
      const container = containerRef.current;
      const canvas = gridCanvasRef.current;
      if (!container || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sized = syncCanvasSize(canvas, container);
      if (!sized) return;
      const { w, h, dpr } = sized;

      const step = cellSize + gap;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;

      if (dimsRef.current.cols !== cols || dimsRef.current.rows !== rows) {
        dimsRef.current = { cols, rows };
        cellsRef.current = buildCells(cols * rows);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const t = time / 1000;
      const cells = cellsRef.current;
      const { start, distance } = fadeParamsRef.current;
      const scrollY = scrollYRef.current;

      for (let row = 0; row < rows; row++) {
        const absoluteY = fadeWithScroll ? scrollY + row * step : 0;
        const fade = fadeWithScroll
          ? Math.min(1, Math.max(MIN_FADE, 1 - (absoluteY - start) / distance))
          : 1;

        for (let col = 0; col < cols; col++) {
          const cell = cells[row * cols + col];
          if (!cell) continue;
          const x = col * step;
          const y = row * step;

          let level = cell.level;
          let alpha = level === 0 ? 0 : 0.5 + level * 0.14;

          if (!reducedMotionRef.current) {
            const twinkle = Math.sin(t * cell.speed + cell.phase);
            if (twinkle > 0.88) {
              level = Math.min(3, level + 2);
              alpha = Math.max(alpha, 0.6);
            }
          }

          alpha *= fade;
          if (alpha <= 0.01) continue;

          ctx.fillStyle = LEVELS[level];
          ctx.globalAlpha = alpha * intensity;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
      ctx.globalAlpha = 1;
    },
    [cellSize, gap, intensity, fadeWithScroll, buildCells],
  );

  /** Soft, tapering streak(s) through the recent pointer path — thick and
   * bright near the cursor, fading to nothing at the tail, like a gust of
   * wind (or a quick slash) trailing the movement. On its own canvas, so it
   * never has to repaint the grid cells underneath it. */
  const drawTrail = useCallback(
    (time: number) => {
      const container = containerRef.current;
      const canvas = trailCanvasRef.current;
      if (!container || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sized = syncCanvasSize(canvas, container);
      if (!sized) return;
      const { w, h, dpr } = sized;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const trail = trailRef.current;
      while (trail.length && time - trail[0].t > TRAIL_MAX_AGE_MS) {
        trail.shift();
      }
      if (trail.length < 2 || reducedMotionRef.current) return;

      const { start, distance } = fadeParamsRef.current;
      const fade = fadeWithScroll
        ? Math.min(
            1,
            Math.max(MIN_FADE, 1 - (scrollYRef.current - start) / distance),
          )
        : 1;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(201, 209, 217, 0.55)";
      ctx.shadowBlur = 10;

      // Two offset passes read as a couple of wind lines rather than one
      // rigid stroke — a cheap way to suggest a gust instead of a wire.
      const passes = [
        { dx: 0, dy: 0, weight: 1 },
        { dx: 3, dy: -2, weight: 0.55 },
      ];

      for (const pass of passes) {
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          const age = time - p1.t;
          const life = Math.max(0, 1 - age / TRAIL_MAX_AGE_MS);
          if (life <= 0) continue;

          ctx.strokeStyle = `rgba(230, 237, 243, ${life * 0.5 * pass.weight * intensity * fade})`;
          ctx.lineWidth = (0.6 + life * 3) * pass.weight;
          ctx.beginPath();
          ctx.moveTo(p0.x + pass.dx, p0.y + pass.dy);
          ctx.lineTo(p1.x + pass.dx, p1.y + pass.dy);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    [intensity, fadeWithScroll],
  );

  const scheduleGridDraw = useCallback(() => {
    if (gridRafRef.current !== null) return;
    gridRafRef.current = requestAnimationFrame((time) => {
      gridRafRef.current = null;
      drawGrid(time);
    });
  }, [drawGrid]);

  const scheduleTrailDraw = useCallback(() => {
    if (trailRafRef.current !== null) return;
    trailRafRef.current = requestAnimationFrame((time) => {
      trailRafRef.current = null;
      drawTrail(time);
    });
  }, [drawTrail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      reducedMotionRef.current = mq.matches;
      scheduleGridDraw();
      scheduleTrailDraw();
    };
    updateMotion();
    mq.addEventListener("change", updateMotion);

    const ro = new ResizeObserver(() => {
      scheduleGridDraw();
      scheduleTrailDraw();
    });
    ro.observe(container);

    const updateFadeParams = () => {
      // Full density through roughly the hero's own height, then fade out
      // over about one more viewport's worth of scroll.
      fadeParamsRef.current = {
        start: window.innerHeight * 0.85,
        distance: window.innerHeight * 1.1,
      };
    };
    updateFadeParams();

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      if (fadeWithScroll) scheduleGridDraw();
    };
    const onResize = () => {
      updateFadeParams();
      scheduleGridDraw();
    };

    if (fadeWithScroll) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || reducedMotionRef.current) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const trail = trailRef.current;
      trail.push({ x, y, t: performance.now() });
      if (trail.length > TRAIL_MAX_POINTS) trail.shift();
      scheduleTrailDraw();
    };
    const onLeave = () => {
      trailRef.current = [];
      scheduleTrailDraw();
    };

    if (interactive) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
    }

    // The grid only needs a slow ambient clock — it's a background texture,
    // not a 60fps animation. The trail (when interactive) needs a faster
    // one so it keeps fading out smoothly between pointer moves, but that
    // interval only ever repaints the small trail canvas, not the grid.
    intervalRef.current = reducedMotionRef.current
      ? null
      : setInterval(() => {
          scheduleGridDraw();
          if (interactive) scheduleTrailDraw();
        }, 120);
    const trailIntervalRef = interactive && !reducedMotionRef.current
      ? setInterval(scheduleTrailDraw, 40)
      : null;

    scheduleGridDraw();
    scheduleTrailDraw();
    const t1 = requestAnimationFrame(scheduleGridDraw);
    const t2 = setTimeout(scheduleGridDraw, 100);

    return () => {
      mq.removeEventListener("change", updateMotion);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (trailIntervalRef !== null) clearInterval(trailIntervalRef);
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      if (gridRafRef.current !== null) cancelAnimationFrame(gridRafRef.current);
      if (trailRafRef.current !== null) cancelAnimationFrame(trailRafRef.current);
    };
  }, [interactive, fadeWithScroll, scheduleGridDraw, scheduleTrailDraw]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 size-full min-h-full", className)}
      aria-hidden
    >
      <canvas ref={gridCanvasRef} className="absolute inset-0 block size-full" />
      <canvas ref={trailCanvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
