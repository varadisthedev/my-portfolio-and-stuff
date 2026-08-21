import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P, Sora } from "next/font/google";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { DomainSlider } from "@/components/layout/DomainSlider";
import { GithubGridBackground } from "@/components/layout/GithubGridBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { site } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

// Only used for the PixelCat's speech-bubble text (DialogBubble) — a true
// 8-bit pixel font, deliberately not part of the general type system.
const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrains.variable} ${pixel.variable} dark h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        {/* Overscroll scrim: even with overscroll-behavior-y disabling the
        bounce (see globals.css), a hard scrollbar-drag past the top can
        still nudge fixed-position content in Chromium, exposing a flat
        strip of plain body background above the grid/nav — a visible "cut"
        against everything else's texture. Sits behind the grid (-z-20 vs.
        its -z-10) so it's invisible under normal circumstances; oversized
        past every edge by more than the bounce ever travels, so whichever
        direction things get nudged, this radial is still there covering the
        gap instead of raw empty space. Solid across the middle, only
        fading at its own far edges — which sit well outside anything that
        ever becomes visible. */}
        <div
          className="fixed -inset-[220px] -z-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 90% at 50% 50%, var(--background) 82%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* Single sitewide instance — the hero no longer paints its own copy
        (see HeroSection.tsx), so there's exactly one canvas behind the whole
        page. Fixed (viewport-sized, not document-sized) for cost reasons;
        the scroll-depth fade is simulated inside the component instead of
        needing a giant absolutely-positioned canvas. */}
        <GithubGridBackground
          className="fixed -z-10"
          interactive
          fadeWithScroll
          cellSize={16}
          gap={6}
          intensity={0.75}
        />
        <CustomCursor />
        <SiteLoader />
        <SiteHeader />
        <DomainSlider />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
