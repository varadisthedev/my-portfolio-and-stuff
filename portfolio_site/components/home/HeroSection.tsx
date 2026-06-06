import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { DotGridBackground } from "@/components/home/DotGridBackground";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/lib/site";
import Counter from '@/components/ReactBits/Counter';



export function HeroSection() {
  return (
    <section id="home" className="relative isolate flex min-h-screen items-center overflow-hidden bg-background pt-[100px] scroll-mt-32">
      <DotGridBackground />
      <div className="pointer-events-none absolute top-1/4 left-1/4 z-0 size-96 rounded-full bg-primary/5 blur-[120px]" />

      <Container className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col gap-(--spacing-stack-md) pt-(--spacing-stack-lg)">
        <div className="flex w-max items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 font-code-label text-secondary">
          <span className="size-2 animate-pulse rounded-full bg-secondary" />
          {heroContent.availability}
        </div>

        <h1 className="font-headline-xl tracking-tighter text-foreground">
          {heroContent.headline[0]}
          <br />
          <span className="text-muted-foreground">
            {heroContent.headline[1]} {heroContent.headline[2]}
          </span>
        </h1>

        <p className="max-w-[600px] font-body-lg text-muted-foreground">
          {heroContent.subheadline}
        </p>

        <div className="mt-2 flex flex-col gap-4 pt-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-auto px-8 py-4 font-code-label uppercase hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(192,193,255,0.4)]"
          >
            <Link href={heroContent.primaryCta.href}>
              {heroContent.primaryCta.label}
              <ArrowDown className="size-[18px]" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto border-outline-variant bg-surface-container-low/50 px-8 py-4 font-code-label uppercase text-foreground hover:border-primary"
          >
            <Link href={heroContent.secondaryCta.href}>
              {heroContent.secondaryCta.label}
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
