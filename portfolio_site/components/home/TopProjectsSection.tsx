import Image from "next/image";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Container } from "@/components/layout/Container";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { SkillTag } from "@/components/ui/SkillTag";
import { topProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

/** Reserves the same footprint whether or not `project.image` is set yet,
 * so dropping a real screenshot into /public later doesn't reflow the
 * card. Placeholder is deliberately quiet — a bordered slot, not a broken
 * image icon shouting for attention. */
function ProjectThumbnail({ project }: { project: Project }) {
  return (
    <div className="relative aspect-video w-full shrink-0 overflow-hidden border border-outline-variant/60 bg-surface-container md:aspect-square md:w-56">
      {project.image ? (
        <Image
          src={project.image}
          alt={`${project.title} preview`}
          fill
          sizes="(min-width: 768px) 224px, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground/60">
          <ImageOff className="size-5" aria-hidden />
          <span className="font-code-label text-[10px]">PREVIEW SOON</span>
        </div>
      )}
    </div>
  );
}

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
            Three projects worth your time.
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

        <div className="mt-(--spacing-stack-md) flex flex-col border border-outline-variant">
          {topProjects.map((project, index) => (
            <div
              key={project.id}
              className="group relative flex flex-col gap-6 border-b border-outline-variant bg-surface-container-low p-8 transition-colors last:border-b-0 hover:bg-surface-container md:flex-row"
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 h-full w-0.5 scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100"
              />

              <ProjectThumbnail project={project} />

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-code-label text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-headline-md text-foreground transition-colors group-hover:text-primary">
                    {project.title}
                  </h3>
                  {project.highlight ? (
                    <span className="border border-secondary/30 bg-secondary/5 px-2 py-0.5 font-code-label text-[11px] text-secondary">
                      {project.highlight}
                    </span>
                  ) : null}
                </div>

                <p className="max-w-2xl font-body-md text-muted-foreground">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <SkillTag key={tag} label={tag} />
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-5">
                  <a
                    href={project.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-code-label text-foreground transition-colors hover:text-secondary"
                  >
                    <SiGithub className="size-4" />
                    Code
                  </a>
                  {project.liveHref ? (
                    <a
                      href={project.liveHref}
                      target="_blank"
                      rel="noreferrer"
                      className="group/live flex items-center gap-1.5 font-code-label text-foreground transition-colors hover:text-secondary"
                    >
                      Live
                      <ArrowUpRight className="size-4 transition-transform group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
