import { Container } from "@/components/layout/Container";
import { PixelCat } from "@/components/ui/PixelCat";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { StackIcon } from "@/components/stack/StackIcon";
import { stackCategories } from "@/lib/stack";

export function TechStackSection() {
  return (
    <section
      id="stack"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      <Container>
        <SectionKicker index="02" label="TECH STACK" />
        <h2 className="max-w-2xl font-headline-lg text-foreground">
          Tools I reach for, and why they earn a place in the stack.
        </h2>

        <div className="relative mt-(--spacing-stack-md)">
          <PixelCat size={2} delay={2.4} className="-top-5 left-10" />

          <div className="grid grid-cols-1 gap-px overflow-hidden border border-outline-variant bg-outline-variant sm:grid-cols-2 xl:grid-cols-4">
            {stackCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-5 bg-background p-6"
              >
                <div>
                  <h3 className="font-code-label text-secondary">
                    {category.label}
                  </h3>
                  <p className="mt-2 font-body-md text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-1.5 border border-outline-variant/60 px-2 py-1 font-code-label text-[11px] text-foreground"
                    >
                      <StackIcon id={item.icon} className="size-3.5" />
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
