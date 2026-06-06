"use client";

import Link from "next/link";
import { Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/routes";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-(--spacing-margin-mobile) py-4 backdrop-blur-xl transition-all duration-300 md:px-(--spacing-margin-desktop)">
      <Link
        href="/#home"
        className="font-headline-md font-extrabold tracking-tighter text-primary md:hidden"
      >
        {site.name}
      </Link>

      <div className="hidden items-center gap-(--spacing-gutter) md:flex">
        {mainNav.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="font-code-label pb-1 font-medium text-muted-foreground transition-colors duration-300 hover:text-secondary"
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-auto gap-2 border-outline-variant bg-transparent px-3 py-2 font-code-label uppercase text-foreground hover:border-primary hover:bg-transparent md:px-4 md:py-2"
        >
          <a href={site.cvUrl} download>
            <span className="hidden sm:inline">Download CV</span>
            <span className="sm:hidden">CV</span>
            <Download className="size-4" />
          </a>
        </Button>

        <button
          type="button"
          className="text-primary md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
      </div>
    </nav>
  );
}
