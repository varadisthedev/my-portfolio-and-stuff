import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { contactContent } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SocialTerminal() {
  const { terminal } = contactContent;

  return (
    <Card className="gap-0 overflow-hidden border-outline-variant bg-surface-container-low p-0 ring-0">
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-2 font-code-label text-muted-foreground">
          {terminal.path}
        </span>
      </div>
      <ul className="flex flex-col gap-3 p-4 font-code-label">
        {terminal.links.map((link) => {
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 text-muted-foreground transition-colors",
                  "hover:text-secondary"
                )}
              >
                <Image
                  src={link.icon}
                  alt={`${link.label} icon`}
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
