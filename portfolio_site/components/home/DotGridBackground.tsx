"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type DotGridBackgroundProps = {
  className?: string;
  spacing?: number;
  radius?: number;
  influenceRadius?: number;
};

/** Always-visible base dots (CSS). Hover glow is painted on canvas. */
const BASE_DOT = "rgba(180, 178, 195, 0.28)";

function hoverAlpha(influence: number) {
  return 0.25 + influence * 0.75;
}

export function DotGridBackground({
  className,
  spacing = 24,
  radius = 1.25,
  influenceRadius = 140,
}: DotGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const drawHover = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width: w, height: h } = container.getBoundingClientRect();
    if (w === 0 || h === 0) return;

    const pixelW = Math.floor(w * dpr);
    const pixelH = Math.floor(h * dpr);

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { x: mx, y: my, active } = mouseRef.current;
    if (!active || reducedMotionRef.current) return;

    const radiusSq = influenceRadius * influenceRadius;

    for (let x = spacing * 0.5; x < w; x += spacing) {
      for (let y = spacing * 0.5; y < h; y += spacing) {
        const dx = x - mx;
        const dy = y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq >= radiusSq) continue;

        const dist = Math.sqrt(distSq);
        const influence = 1 - dist / influenceRadius;
        const t = influence * influence;
        const alpha = hoverAlpha(t);
        const size = radius + t * 1.1;

        // Indigo → cyan → white as influence increases (Stitch-style spotlight)
        const r = Math.round(144 + (192 - 144) * t + (255 - 192) * t * t);
        const g = Math.round(143 + (193 - 143) * t + (255 - 193) * t * t);
        const b = Math.round(160 + (255 - 160) * t + (255 - 255) * t * t);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }
    }
  }, [spacing, radius, influenceRadius]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawHover();
    });
  }, [drawHover]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      reducedMotionRef.current = mq.matches;
      scheduleDraw();
    };
    updateMotion();
    mq.addEventListener("change", updateMotion);

    const ro = new ResizeObserver(scheduleDraw);
    ro.observe(container);

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const inside =
        x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

      mouseRef.current = inside
        ? { x, y, active: true }
        : { x: -9999, y: -9999, active: false };
      scheduleDraw();
    };

    const onMouseMove = (e: MouseEvent) =>
      updatePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
      scheduleDraw();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    // Layout may not be ready on first paint — retry after mount
    scheduleDraw();
    const t1 = requestAnimationFrame(scheduleDraw);
    const t2 = setTimeout(scheduleDraw, 100);

    return () => {
      mq.removeEventListener("change", updateMotion);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [drawHover, scheduleDraw]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 size-full min-h-full",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle, ${BASE_DOT} ${radius}px, transparent ${radius}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: `${spacing / 2}px ${spacing / 2}px`,
      }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block size-full"
      />
    </div>
  );
}
