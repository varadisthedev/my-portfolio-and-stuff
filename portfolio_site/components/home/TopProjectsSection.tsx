import { ArrowUpRight, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Container } from "@/components/layout/Container";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { SkillTag } from "@/components/ui/SkillTag";
import { topProjects } from "@/lib/projects";

export function TopProjectsSection() {
  return (
    <section
      id="work"
      className="relative scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      {/* Softens the seam with the hero above: the sitewide grid background
      (see GithubGridBackground) is still fairly bright this early in the
      scroll-depth fade, so without this the border above just reads as the
      hero's texture continuing past its own edge rather than the page
      actually moving on. Blur fades out via the mask so it's a soft
      transition, not a hard blur cutoff. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 backdrop-blur-sm"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <Container>
        <SectionKicker index="01" label="SELECTED WORK" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl font-headline-lg text-foreground">
            Four projects worth your time.
          </h2>
          <a
            href="https://github.com/varadisthedev?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-code-label text-muted-foreground transition-colors hover:text-secondary"
          >
            All repositories
            <ArrowUpRight className="size-4" />
          </a>
        </div>

        {/* Separate cards rather than one joined list: the screenshots are
        the point here, and they need air around them to read as screens
        instead of rows. */}
        <div className="mt-(--spacing-stack-md) flex flex-col gap-10">
          {topProjects.map((project, index) => {
            const isDownload = Boolean(project.liveLabel);
            return (
              <article
                key={project.id}
                className="group relative overflow-hidden border border-outline-variant bg-surface-container-low transition-colors hover:border-outline-variant hover:bg-surface-container"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 z-10 h-full w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-500 group-hover:scale-y-100"
                />

                <ProjectCarousel
                  images={project.images}
                  title={project.title}
                  label={project.previewLabel}
                />

                <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10 md:p-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-code-label text-secondary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-headline-md text-foreground transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                    </div>

                    <p className="max-w-3xl font-body-md text-muted-foreground">
                      {project.description}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <SkillTag key={tag} label={tag} />
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <Button
                      asChild
                      className="h-11 px-5 font-code-label text-xs"
                    >
                      <a
                        href={project.liveHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.liveLabel ?? "Live site"}
                        {isDownload ? (
                          <Download className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                        )}
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 px-5 font-code-label text-xs"
                    >
                      <a
                        href={project.repoHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <SiGithub className="size-4" />
                        Source
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
