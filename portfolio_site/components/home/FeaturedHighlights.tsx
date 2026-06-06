import Image from "next/image";
import { Blocks } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SkillTag } from "@/components/ui/SkillTag";
import { featuredHighlights } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FeaturedHighlights() {
  const { architecture, metric, project } = featuredHighlights;

  return (
    <section
      id="work"
      className="relative z-10 bg-[#0e0e0e] py-(--spacing-stack-lg) scroll-mt-32"
    >
      <Container>
        <h2 className="mb-(--spacing-stack-md) font-headline-lg text-foreground">
          {featuredHighlights.title}
        </h2>

        <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-(--spacing-gutter) md:grid-cols-12">
          <Card
            className={cn(
              "group relative overflow-hidden border-outline-variant bg-surface-container-low p-8 ring-0 md:col-span-8",
              "hover:border-outline transition-colors"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full flex-col">
              <SectionLabel icon={<Blocks className="size-[18px]" />}>
                {architecture.label}
              </SectionLabel>
              <h3 className="mb-4 max-w-lg font-headline-md text-foreground">
                {architecture.title}
              </h3>
              <div className="mt-auto flex flex-wrap gap-2">
                {architecture.skills.map((skill) => (
                  <SkillTag key={skill} label={skill} />
                ))}
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "flex flex-col items-center justify-center border-outline-variant bg-surface-container p-8 text-center ring-0 md:col-span-4",
              "hover:border-primary/50 transition-colors"
            )}
          >
            <div className="font-headline-xl text-primary">{metric.value}</div>
            <div className="mt-2 font-code-label uppercase tracking-widest text-muted-foreground">
              {metric.label}
            </div>
            <div className="mt-4 h-1 w-12 rounded-full bg-outline-variant" />
          </Card>

          <Card
            className={cn(
              "group mt-4 cursor-pointer border-outline-variant bg-surface-container-highest p-2 ring-0 md:col-span-12"
            )}
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-surface md:aspect-[3/1]">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                className="object-cover opacity-50 mix-blend-luminosity grayscale transition-all duration-700 group-hover:opacity-80 group-hover:grayscale-0"
                sizes="(max-width: 768px) 100vw, 1280px"
                unoptimized
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-(--spacing-margin-mobile) md:p-(--spacing-margin-desktop)">
                <SectionLabel>
                  <span className="size-2 rounded-full bg-secondary" />
                  {project.label}
                </SectionLabel>
                <h3 className="mb-2 font-headline-lg text-foreground">
                  {project.title}
                </h3>
                <p className="hidden max-w-2xl font-body-md text-muted-foreground md:block">
                  {project.description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
