"use client";

import { useEffect, useState } from "react";

// GET /api/visit increments the shared counter and returns the new total, so
// this only fires once per browser session — SiteFooter lives in the root
// layout, which stays mounted across client-side navigations.
export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/visit")
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setCount(data.count);
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className=" text-center font-code-label text-muted-foreground">
      {count === null ? "counting visitors…" : `Hello, visitor #${count.toLocaleString()}! I hope you liked my portfolio! Give me a visit again.`}
    </p>
  );
}
