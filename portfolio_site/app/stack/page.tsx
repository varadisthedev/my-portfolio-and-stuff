import { Container } from "@/components/layout/Container";
import { TechLogoMarquee } from "@/components/home/TechLogoMarquee";
export default function StackPage() {
  return (
    <>
      <Container className="py-(--spacing-stack-lg) pt-32">
        <h1 className="font-headline-lg text-foreground">Stack</h1>
        <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
          Technologies and tools — coming soon.
        </p>

      </Container>
      <TechLogoMarquee />
    </>
  );
}
