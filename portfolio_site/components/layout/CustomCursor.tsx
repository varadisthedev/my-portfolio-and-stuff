"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [role="link"], summary, label';

/**
 * A themed replacement for the OS pointer: a small solid dot pinned exactly
 * to the cursor position, plus a square (not round — this site has no
 * rounded corners anywhere else) outline ring that trails a step behind
 * with easing. Ring grows and fills on hover over anything clickable, and
 * contracts on press, so it still carries all the state cues a native
 * cursor would.
 *
 * Only activates on devices that report a real mouse (`hover: hover` and
 * `pointer: fine`) — touch/coarse-pointer devices never see it and keep
 * their native behavior untouched, native `cursor` included.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    document.documentElement.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    const setHover = (hovering: boolean) => {
      ringEl.classList.toggle("custom-cursor-ring--hover", hovering);
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (reduceMotion) {
        ring.current = target.current;
        ringEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const el = e.target instanceof Element ? e.target : null;
      setHover(!!el?.closest(INTERACTIVE_SELECTOR));
    };

    const onDown = () => ringEl.classList.add("custom-cursor-ring--down");
    const onUp = () => ringEl.classList.remove("custom-cursor-ring--down");
    const onLeaveWindow = () => {
      dot.style.opacity = "0";
      ringEl.style.opacity = "0";
    };
    const onEnterWindow = () => {
      dot.style.opacity = "1";
      ringEl.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    document.documentElement.addEventListener("mouseenter", onEnterWindow);

    if (!reduceMotion) {
      const tick = () => {
        // Ring lags the raw pointer with simple exponential easing — the
        // "trailing" feel — while the dot above stays pinned exactly to the
        // cursor so precision (e.g. clicking small targets) never suffers.
        ring.current.x += (target.current.x - ring.current.x) * 0.22;
        ring.current.y += (target.current.y - ring.current.y) * 0.22;
        ringEl.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.removeEventListener("mouseenter", onEnterWindow);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden />
    </>
  );
}
