import { ContactSection } from "@/components/home/ContactSection";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OpenSourceSection } from "@/components/home/OpenSourceSection";
import { TechStackSection } from "@/components/home/TechStackSection";
import { TopProjectsSection } from "@/components/home/TopProjectsSection";
import { getGithubStats } from "@/lib/githubStats";

export default async function HomePage() {
  const githubStats = await getGithubStats();

  return (
    <div>
      <HeroSection />
      <TopProjectsSection />
      <ExperienceSection />
      <TechStackSection />
      <OpenSourceSection stats={githubStats} />
      <ContactSection />
    </div>
  );
}
