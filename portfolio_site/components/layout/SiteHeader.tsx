"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/lib/routes";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const sectionId = (href: string) => href.replace("/#", "");

type NavItem =
  | { kind: "scroll"; id: string; label: string; href: string }
  | { kind: "download"; id: "cv"; label: string; href: string };

// The CV entry tracks `id="cv"` on ResumeDownload (components/home/
// ResumeDownload.tsx, in the contact section) — it lights up the same way
// every other section does, it just downloads instead of scrolling.
const NAV_ITEMS: NavItem[] = [
  ...mainNav.map(
    (item): NavItem => ({
      kind: "scroll",
      id: sectionId(item.href),
      label: item.label,
      href: item.href,
    }),
  ),
  { kind: "download", id: "cv", label: "CV", href: site.cvUrl },
];
const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(SECTION_IDS[0]);

  // Scrollspy: an "active band" near vertical-center of the viewport (not
  // the whole viewport) decides which section is active, so switching feels
  // tied to what's actually being read rather than firing the instant any
  // sliver of the next section peeks in at the bottom.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-(--spacing-margin-mobile)">
      <div className="relative">
        <nav className="flex items-center gap-1 border border-outline-variant/60 bg-background/60 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <Link
            href="/#home"
            className="mr-1 hidden pl-2 font-code-label text-foreground sm:block"
          >
            {site.name.split(" ")[0]}
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeId;
              const className = cn(
                "relative px-3 py-1.5 font-code-label transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              );
              const pill = isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 -z-10 border border-primary/30 bg-primary/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              );

              return item.kind === "download" ? (
                <a
                  key={item.id}
                  href={item.href}
                  download
                  onClick={() => setActiveId(item.id)}
                  className={className}
                >
                  {pill}
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveId(item.id)}
                  className={className}
                >
                  {pill}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="ml-1 p-1.5 text-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {open ? (
          <div className="absolute top-full left-1/2 mt-2 flex w-[min(88vw,300px)] -translate-x-1/2 flex-col border border-outline-variant/60 bg-background/95 p-2 backdrop-blur-xl md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeId;
              const className = cn(
                "px-3 py-2.5 font-code-label",
                isActive ? "text-primary" : "text-muted-foreground",
              );
              const onClick = () => {
                setOpen(false);
                setActiveId(item.id);
              };

              return item.kind === "download" ? (
                <a
                  key={item.id}
                  href={item.href}
                  download
                  onClick={onClick}
                  className={className}
                >
                  Download {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClick}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
