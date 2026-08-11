"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface ClockPillsProps {
  /** Server render time (ISO string), used as the first paint so client and
   * server markup match exactly — no post-mount flash from a placeholder. */
  initial: string;
}

export function ClockPills({ initial }: ClockPillsProps) {
  const [now, setNow] = useState(() => new Date(initial));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString(undefined, { month: "short", day: "2-digit" }).toUpperCase();
  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-text-dim">
      <span className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-1">
        <Calendar size={12} />
        {date}
      </span>
      <span className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-1">
        <Clock size={12} />
        {time}
      </span>
    </div>
  );
}
