import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  as?: "div" | "section";
};

export function Container({
  className,
  as: Comp = "div",
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full max-w-(--spacing-container-max) px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)",
        className
      )}
      {...props}
    />
  );
}
