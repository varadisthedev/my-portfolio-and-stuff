import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedHighlights } from "@/components/home/FeaturedHighlights";
import ProjectsPage from "@/app/projects/page";
import StackPage from "@/app/stack/page";
import AchievementsPage from "@/app/achievements/page";
import OpenSourcePage from "@/app/open-source/page";
import ContactPage from "@/app/contact/page";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedHighlights />

      <section id="projects" className="scroll-mt-32 py-(--spacing-stack-lg)">
        <ProjectsPage />
      </section>

      <section id="stack" className="scroll-mt-32 py-(--spacing-stack-lg)">
        <StackPage />
      </section>

      <section id="achievements" className="scroll-mt-32 py-(--spacing-stack-lg)">
        <AchievementsPage />
      </section>

      <section id="open-source" className="scroll-mt-32 py-(--spacing-stack-lg)">
        <OpenSourcePage />
      </section>

      <section id="contact" className="scroll-mt-32 py-(--spacing-stack-lg)">
        <ContactPage />
      </section>
    </div>
  );
}
