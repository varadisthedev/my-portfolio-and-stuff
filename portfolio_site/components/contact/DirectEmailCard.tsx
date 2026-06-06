import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { contactContent } from "@/lib/site";

export function DirectEmailCard() {
  const { email } = contactContent;

  return (
    <Card className="gap-0 border-outline-variant bg-surface-container-low p-6 ring-0">
      <Mail className="mb-4 size-5 text-muted-foreground" />
      <h2 className="font-headline-md text-foreground">{email.title}</h2>
      <p className="mt-2 font-body-md text-muted-foreground">{email.description}</p>
      <Link
        href={email.href}
        className="mt-6 inline-flex items-center gap-2 font-code-label text-secondary transition-colors hover:text-secondary/80"
      >
        {email.address}
        <ArrowRight className="size-4" />
      </Link>
    </Card>
  );
}
