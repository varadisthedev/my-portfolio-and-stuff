import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, icon, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2 font-code-label text-secondary",
        className
      )}
    >
      {icon}
      {children}
    </div>
  );
}
