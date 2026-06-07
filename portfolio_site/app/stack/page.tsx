import { Container } from "@/components/layout/Container";
import { StackGrid } from "@/components/stack/StackGrid";

export default function StackPage() {
  return (
    <>
      <Container className="pt-32 pb-4">
        {/* Page heading */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="font-headline-lg text-foreground">Stack</h1>
          <p className="font-body-lg text-muted-foreground">
            Every tool I reach for — and why it earns its place in the
            workflow.
          </p>
        </div>
      </Container>

      <Container className="py-(--spacing-stack-lg)">
        <StackGrid />
      </Container>


    </>
  );
}
