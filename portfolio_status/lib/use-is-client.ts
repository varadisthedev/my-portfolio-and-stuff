"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards. Use it to gate
 * anything the server can't know — the viewer's locale, timezone, or clock —
 * so hydration doesn't mismatch and the server's value doesn't stick around.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
