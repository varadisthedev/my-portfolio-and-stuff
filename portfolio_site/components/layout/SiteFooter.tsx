import Link from "next/link";
import { socialLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="relative z-20 grid w-full grid-cols-1 items-center gap-4 border-t border-outline-variant bg-surface px-(--spacing-margin-mobile) py-(--spacing-stack-md) md:grid-cols-3 md:px-(--spacing-margin-desktop)">
      <div className="font-headline-md text-center font-bold text-foreground md:text-left">
        {site.name}
      </div>

      <p className="font-body-md text-center text-muted-foreground">
        {site.copyright}
      </p>

      <div className="flex flex-wrap justify-center gap-6 md:justify-end">
        {socialLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-code-label text-muted-foreground transition-colors duration-300",
              "hover:text-secondary"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
