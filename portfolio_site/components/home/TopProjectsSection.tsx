import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProjectCard } from "@/components/home/ProjectCard";
import { SectionKicker } from "@/components/ui/SectionKicker";
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
          {topProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
