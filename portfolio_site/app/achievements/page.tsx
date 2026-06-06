import { Container } from "@/components/layout/Container";

export default function AchievementsPage() {
  return (
    <Container className="py-(--spacing-stack-lg) pt-32">
      <h1 className="font-headline-lg text-foreground">Achievements</h1>
      <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
        Milestones and recognition — coming soon.
      </p>
    </Container>
  );
}
