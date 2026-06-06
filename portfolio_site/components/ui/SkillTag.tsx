import { cn } from "@/lib/utils";

type SkillTagProps = {
  label: string;
  className?: string;
};

export function SkillTag({ label, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-[#1E1E1E] px-3 py-1.5 font-code-label text-xs text-foreground",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {label}
    </span>
  );
}
