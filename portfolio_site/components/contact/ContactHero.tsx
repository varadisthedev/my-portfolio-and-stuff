import { contactContent } from "@/lib/site";

export function ContactHero() {
  return (
    <div className="mb-(--spacing-stack-md) max-w-3xl">
      <div className="mb-6 flex w-max items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 font-code-label text-secondary">
        <span className="size-2 animate-pulse rounded-full bg-secondary" />
        {contactContent.status}
      </div>
      <h1 className="font-headline-xl tracking-tighter text-foreground">
        {contactContent.headline}
      </h1>
      <p className="mt-4 max-w-2xl font-body-lg text-muted-foreground">
        {contactContent.subheadline}
      </p>
    </div>
  );
}
