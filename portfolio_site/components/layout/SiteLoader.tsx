"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/layout/Loader";

const MIN_VISIBLE_MS = 3500;
const FADE_MS = 400;

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

/** The Network Information API is Chromium-only (no Safari/Firefox), so
 * this can only ever detect *known* bad connections — everything else
 * (including "unsupported browser") falls back to treating the connection
 * as fine, which is the safe default: it means the 2s floor applies rather
 * than silently never applying anywhere it can't be verified. */
function hasBadConnection(): boolean {
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  const connection = nav.connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

/**
 * Full-page splash shown on the initial hard load only — it listens for the
 * browser `load` event, which fires once per document load, not on
 * client-side route changes within this layout. Holds for at least
 * `MIN_VISIBLE_MS` regardless of how fast the real load is, so the loader
 * is never just a flash — except for connections already detected as slow,
 * where padding an already-bad load with more waiting would be actively
 * unkind, so that floor is skipped entirely there.
 */
export function SiteLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const mountedAt = Date.now();
    const minVisibleMs = hasBadConnection() ? 0 : MIN_VISIBLE_MS;

    const finish = () => {
      const elapsed = Date.now() - mountedAt;
      window.setTimeout(() => setFading(true), Math.max(minVisibleMs - elapsed, 0));
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }

    window.addEventListener("load", finish, { once: true });
    return () => window.removeEventListener("load", finish);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const timeout = window.setTimeout(() => setVisible(false), FADE_MS);
    return () => window.clearTimeout(timeout);
  }, [fading]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity ease-out ${fading ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={fading}
    >
      <Loader />
    </div>
  );
}
