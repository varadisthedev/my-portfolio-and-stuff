import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { DirectEmailCard } from "@/components/contact/DirectEmailCard";
import { SocialTerminal } from "@/components/contact/SocialTerminal";
import { Container } from "@/components/layout/Container";

export default function ContactPage() {
  return (
    <Container className="pb-(--spacing-stack-lg) pt-28 md:pt-32">
      <ContactHero />

      <div className="grid grid-cols-1 gap-(--spacing-gutter) lg:grid-cols-12">
        <div className="flex flex-col gap-(--spacing-gutter) lg:col-span-4">
          <DirectEmailCard />
          <SocialTerminal />
        </div>

        <div className="lg:col-span-8">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
