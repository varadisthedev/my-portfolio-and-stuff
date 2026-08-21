import { ContactForm } from "@/components/contact/ContactForm";
import { DirectEmailCard } from "@/components/contact/DirectEmailCard";
import { SocialTerminal } from "@/components/contact/SocialTerminal";
import { Container } from "@/components/layout/Container";
import { ResumeDownload } from "@/components/home/ResumeDownload";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { contactContent } from "@/lib/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-32 border-t border-outline-variant py-(--spacing-stack-lg)"
    >
      <Container>
        <SectionKicker index="05" label="CONTACT" />
        <h2 className="max-w-2xl font-headline-lg text-foreground">
          {contactContent.headline}
        </h2>
        <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
          {contactContent.subheadline}
        </p>

        <div className="mt-(--spacing-stack-md) grid grid-cols-1 gap-(--spacing-gutter) lg:grid-cols-12">
          <div className="flex flex-col gap-(--spacing-gutter) lg:col-span-4">
            <DirectEmailCard />
            <SocialTerminal />
          </div>

          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </Container>

      <div className="mt-64 pb-(--spacing-stack-lg)">
        <Container className="flex justify-center">
          <ResumeDownload />
        </Container>
      </div>
    </section>
  );
}
