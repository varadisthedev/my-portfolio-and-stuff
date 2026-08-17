import { cn } from "@/lib/utils";

type SectionKickerProps = {
  index: string;
  label: string;
  className?: string;
};

export function SectionKicker({ index, label, className }: SectionKickerProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 font-code-label text-muted-foreground",
        className
      )}
    >
      <span className="text-secondary">{"//"}</span>
      <span className="text-secondary">{index}</span>
      <span>{label}</span>
      <span className="h-px flex-1 bg-outline-variant" aria-hidden />
    </div>
  );
}
