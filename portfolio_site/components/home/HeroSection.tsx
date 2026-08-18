import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { PixelCat } from "@/components/ui/PixelCat";
import { heroContent, site } from "@/lib/site";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden pt-[100px] scroll-mt-32"
    >
      {/* The grid itself is a single sitewide instance (see app/layout.tsx) so
      there's only ever one canvas behind the page, not a hero-local one
      double-painted under the sitewide one. Vignette: keeps the grid loud at
      the edges while staying out of the way of the text column, instead of
      dimming the whole thing uniformly. Sized wide enough to fully cover the
      longest paragraph line rather than moving the text further left to
      chase it — the left padding here is already as tight as it can be
      without colliding with DomainSlider, so widening the dark patch was
      the safer fix. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 90% at 20% 50%, var(--background) 45%, transparent 80%)",
        }}
        aria-hidden
      />

      {/* Left padding clears DomainSlider (fixed, vertically centered,
      `left-4 md:left-6` + a ~48px-wide pill), but only just — pulled in as
      close as that allows so the text sits inside the vignette's dark patch
      (centered at 20% above) rather than drifting past it. */}
      <Container className="relative z-10 grid w-full grid-cols-1 gap-(--spacing-stack-lg) py-(--spacing-stack-lg) pr-(--spacing-margin-mobile) pl-16 md:pr-(--spacing-margin-desktop) md:pl-20">
        <div className="flex min-w-0 max-w-3xl flex-col gap-(--spacing-stack-md)">
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-code-label text-primary">{heroContent.eyebrow}</p>

          </div>

          <h1 className="font-heading text-[clamp(2.4rem,9vw,6.5rem)] leading-[0.95] font-extrabold tracking-tighter text-foreground uppercase">
            {site.name}
          </h1>

          <p className="max-w-[720px] font-headline-md text-muted-foreground">
            <span className="text-primary">{heroContent.headlineHighlight}</span>{" "}
            {heroContent.headline}
          </p>

          <p className="max-w-[600px] font-body-lg text-muted-foreground">
            {heroContent.subheadline}
          </p>

          <div className="relative mt-2 flex flex-col gap-4 pt-2 sm:flex-row">

            <Button asChild size="lg" className="h-auto px-8 py-4 font-code-label uppercase">
              <Link href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
                <ArrowDown className="size-[18px]" />
              </Link>
            </Button>


            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto border-outline-variant bg-transparent px-8 py-4 font-code-label uppercase text-foreground hover:border-primary"
            >
              <Link href={heroContent.secondaryCta.href}>
                {heroContent.secondaryCta.label}
                <ArrowUpRight className="size-[18px]" />
              </Link>
            </Button>
            {/* <PixelCat size={4} delay={1.2} className="-top-10 left-2" catColor="#0D0D0D" catEyeColor="#FFF" catOutlineColor="#FFF" /> */}

          </div>
        </div>
      </Container>
    </section>
  );
}
