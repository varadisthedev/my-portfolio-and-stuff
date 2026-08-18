import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { VisitorCounter } from "@/components/layout/VisitorCounter";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-outline-variant bg-background">
      <div className="grid grid-cols-1 items-center gap-4 px-(--spacing-margin-mobile) py-(--spacing-stack-md) md:grid-cols-3 md:px-(--spacing-margin-desktop)">
        <div className="text-center font-code-label text-foreground md:text-left">
          {site.name}
        </div>

        <p className="text-center font-code-label text-muted-foreground">
          built from scratch by me :)
        </p>

        <div className="flex justify-center md:justify-end">
          <Link
            href={site.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-code-label text-muted-foreground transition-colors duration-300 hover:text-secondary"
          >
            <SiGithub className="size-4" />
            Portfolio source for curious devs
          </Link>
        </div>
      </div>

      <div className="border-t border-outline-variant px-(--spacing-margin-mobile) py-3 md:px-(--spacing-margin-desktop)">
        <VisitorCounter />
      </div>
    </footer>
  );
}
