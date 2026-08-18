"use client";

import { useEffect, useRef } from "react";

const FIELD_SELECTOR = "input, textarea, select";

/**
 * A themed replacement for the OS pointer: a small solid dot pinned exactly
 * to the cursor position, plus a square (not round — this site has no
 * rounded corners anywhere else) outline ring that trails a step behind
 * with easing. The ring stays this same fixed size no matter what's under
 * it — it only contracts on press (`custom-cursor-ring--down`) — so
 * hovering an input, a button, or empty space all look identical. A
 * previous version resized the ring to match whatever form field was under
 * the cursor, but kept tracking the *cursor's* (lagging) position rather
 * than the field's, so a field-sized box ended up dragging around behind
 * the mouse instead of sitting on the field — chaotic overlapping
 * rectangles rather than a clean hover state. Simplicity fixed it more
 * reliably than trying to also fix the positioning math.
 *
 * The ring additionally hides itself while the mouse sits inside the
 * currently-focused text field — the ring trailing a step behind the real
 * pointer is exactly what makes it collide with a caret/selection the user
 * is trying to work with. It reappears the moment the mouse leaves that
 * field, which also resets the field's own `data-cursor-active` highlight
 * even though it's still genuinely focused: this site's field highlight is
 * meant to track where the mouse is actively engaging, not raw focus
 * state, so wandering the mouse off (not blurring) resets the look too.
 * `data-cursor-active` itself is set/cleared by plain `focusin`/`focusout`
 * listeners below, so it still works correctly for keyboard/touch — only
 * the "leaving resets it early" behavior is specific to a real mouse.
 *
 * The ring/dot/reset-on-leave behavior only activates on devices that
 * report a real mouse (`hover: hover` and `pointer: fine`) — touch/coarse
 * devices never see it and keep their native cursor and focus behavior.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const wasOverActiveFieldRef = useRef(false);

  // Universal, not gated behind the mouse-only media query below: every
  // device needs a focus indicator, this is just the one driving it
  // instead of `:focus-visible` so the mouse-based reset further down has
  // something to override.
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches(FIELD_SELECTOR)) {
        el.setAttribute("data-cursor-active", "true");
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement) el.removeAttribute("data-cursor-active");
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

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

    // Shared by the mousemove handler and the focusin handler below: tapping
    // into a field doesn't itself generate a mousemove, so relying on
    // mousemove alone to hide the ring meant it stayed visible until the
    // user nudged the mouse a few px post-click. Re-running this from
    // focusin too (against the last-known pointer position, not a fresh
    // event) makes it react the instant focus lands instead.
    const syncFieldState = (x: number, y: number) => {
      const activeEl = document.activeElement;
      const isFieldFocused = activeEl instanceof HTMLElement && activeEl.matches(FIELD_SELECTOR);
      const rect = isFieldFocused ? activeEl.getBoundingClientRect() : null;
      const isOverActiveField =
        !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      ringEl.style.opacity = isOverActiveField ? "0" : "1";

      if (wasOverActiveFieldRef.current && !isOverActiveField && isFieldFocused) {
        (activeEl as HTMLElement).removeAttribute("data-cursor-active");
      }
      wasOverActiveFieldRef.current = isOverActiveField;
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (reduceMotion) {
        ring.current = target.current;
        ringEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      syncFieldState(e.clientX, e.clientY);
    };

    const onFocusIn = () => syncFieldState(target.current.x, target.current.y);
    document.addEventListener("focusin", onFocusIn);

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
      document.removeEventListener("focusin", onFocusIn);
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
