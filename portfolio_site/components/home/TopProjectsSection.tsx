import { ArrowUpRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Container } from "@/components/layout/Container";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { SkillTag } from "@/components/ui/SkillTag";
import { topProjects } from "@/lib/projects";

export function TopProjectsSection() {
  return (
    <section
      id="work"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
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
              className="grid grid-cols-1 gap-6 border-b border-outline-variant p-8 transition-colors last:border-b-0 hover:bg-surface-container-low md:grid-cols-[80px_1fr]"
            >
              <span className="font-code-label text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-headline-md text-foreground">
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
                      className="flex items-center gap-1.5 font-code-label text-foreground transition-colors hover:text-secondary"
                    >
                      Live
                      <ArrowUpRight className="size-4" />
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
