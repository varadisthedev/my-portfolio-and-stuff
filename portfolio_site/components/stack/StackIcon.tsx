"use client";

import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiShadcnui,
  SiHtml5,
  SiCss,
  SiNodedotjs,
  SiExpress,
  SiOpenapiinitiative,
  SiJsonwebtokens,
  SiSocketdotio,
  SiMongodb,
  SiPostgresql,
  SiRedis,
  SiGit,
  SiGithub,
  SiDocker,
  SiLinux,
  SiPostman,
  SiVercel,
  SiIterm2,
} from "react-icons/si";
import type { IconType } from "react-icons";

// ─── Static icon map ──────────────────────────────────────────────────────────
// Add new icons here and reference them by key in lib/stack.ts.
const ICON_MAP: Record<string, IconType> = {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiShadcnui,
  SiHtml5,
  SiCss,
  SiNodedotjs,
  SiExpress,
  SiOpenapiinitiative,
  SiJsonwebtokens,
  SiSocketdotio,
  SiMongodb,
  SiPostgresql,
  SiRedis,
  SiGit,
  SiGithub,
  SiDocker,
  SiLinux,
  SiPostman,
  SiVercel,
  SiIterm2,
};

// ─── Component ────────────────────────────────────────────────────────────────
export function StackIcon({
  id,
  className = "size-[18px]",
}: {
  id: string;
  className?: string;
}) {
  const Icon = ICON_MAP[id] ?? SiIterm2;
  // Brand color map — hex values for each icon key. Add entries as needed.
  const BRAND_COLOR_MAP: Record<string, string> = {
    SiJavascript: "#f7df1e",
    SiTypescript: "#3178c6",
    SiReact: "#61dafb",
    SiNextdotjs: "#000000",
    SiTailwindcss: "#38bdf8",
    SiNodedotjs: "#3C873A",
    SiMongodb: "#47A248",
    SiPostgresql: "#4169E1",
    SiDocker: "#2496ED",
    SiRedis: "#DC382D",
    SiGit: "#F05032",
    SiGithub: "#181717",
    SiHtml5: "#E34F26",
    SiCss: "#1572B6",
    SiPostman: "#FF6C37",
    SiVercel: "#000000",
  };

  const color = BRAND_COLOR_MAP[id];
  return <Icon className={className} style={color ? { color } : undefined} />;
}
