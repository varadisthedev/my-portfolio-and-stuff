"use client";

import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactContent } from "@/lib/site";
import { cn } from "@/lib/utils";

// Driven by `data-cursor-active` (see CustomCursor.tsx), not
// `:focus-visible` — the latter stays true for as long as the field is
// focused regardless of where the mouse is, which is exactly what this
// site doesn't want: the highlight should track active mouse engagement,
// so it resets the moment the cursor leaves the field even if it's still
// focused. CustomCursor sets/clears the attribute on focusin/focusout
// universally (keyboard and touch included), and additionally clears it
// early — before blur — when a real mouse moves off the field.
const fieldClassName = cn(
  "h-11 rounded-lg border-outline-variant bg-[#050505] px-3 font-body-md text-foreground transition-all duration-200",
  "placeholder:text-muted-foreground/60",
  // Cancels the base Input/Textarea's own native `focus-visible:` ring
  // (see ui/input.tsx, ui/textarea.tsx) — same variant/property as those,
  // so tailwind-merge drops theirs in favor of these, since it would
  // otherwise show regardless of the data-attribute state below.
  "focus-visible:border-outline-variant focus-visible:ring-0",
  "data-[cursor-active=true]:border-primary data-[cursor-active=true]:ring-2 data-[cursor-active=true]:ring-primary/25 data-[cursor-active=true]:shadow-[0_0_0_1px_rgba(63,185,80,0.25)]"
);

const labelClassName = "font-code-label uppercase text-muted-foreground";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceNotice, setEnhanceNotice] = useState<string | null>(null);
  const [hasMessage, setHasMessage] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name")?.toString() ?? "";
    const email = data.get("email")?.toString() ?? "";
    const subject = data.get("subject")?.toString() ?? "";
    const message = data.get("message")?.toString() ?? "";

    try {
      const response = await axios.post<{ success?: boolean; message?: string }>(
        "/api/contact",
        { name, email, subject, message }
      );

      if (!response.data?.success) {
        throw new Error("Failed to send message");
      }

      form.reset();
      setHasMessage(false);
      setEnhanceNotice(null);
      setStatusMessage(response.data.message ?? "Message sent successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError =
          (error.response?.data as { error?: string } | undefined)?.error ??
          "Unable to send message right now. Please try again.";
        setStatusMessage(apiError);
      } else {
        setStatusMessage("Unable to send message right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEnhance() {
    const textarea = messageRef.current;
    const message = textarea?.value.trim();
    if (!textarea || !message || isEnhancing) return;

    setIsEnhancing(true);
    setEnhanceNotice(null);

    try {
      const response = await axios.post<{ success?: boolean; message?: string }>(
        "/api/enhance",
        { message }
      );

      if (!response.data?.success || !response.data.message) {
        throw new Error("Failed to enhance message");
      }

      // Uncontrolled on purpose (see `messageRef`) — setting `.value`
      // directly avoids making the whole textarea controlled just for this
      // one action.
      textarea.value = response.data.message;
      textarea.focus();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError =
          (error.response?.data as { error?: string } | undefined)?.error ??
          "Couldn't enhance that right now. Please try again.";
        setEnhanceNotice(apiError);
      } else {
        setEnhanceNotice("Couldn't enhance that right now. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  }

  return (
    <Card className="border-outline-variant bg-surface-container-low p-6 ring-0 md:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className={labelClassName}>
              Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Your name"
              className={fieldClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className={labelClassName}>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="subject" className={labelClassName}>
            Subject
          </Label>
          <Input
            id="subject"
            name="subject"
            required
            placeholder="What's this about?"
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="message" className={labelClassName}>
              Message
            </Label>
            <button
              type="button"
              onClick={handleEnhance}
              disabled={!hasMessage || isEnhancing || isSubmitting}
              className="flex items-center gap-1.5 border border-outline-variant/60 px-2 py-1 font-code-label text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline-variant/60 disabled:hover:text-muted-foreground"
            >
              <Sparkles className={cn("size-3", isEnhancing && "animate-pulse")} />
              {isEnhancing ? "Enhancing..." : "AI"}
            </button>
          </div>
          <Textarea
            ref={messageRef}
            id="message"
            name="message"
            required
            rows={6}
            onChange={(e) => setHasMessage(e.target.value.trim().length > 0)}
            placeholder="Keep it brief or rough.You can also tap on 'AI' above to clean up the wording without changing your tone."
            className={cn(fieldClassName, "min-h-40 resize-y py-3")}
          />
          {enhanceNotice ? (
            <p className="font-body-md text-xs text-muted-foreground">{enhanceNotice}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isEnhancing}
          className="h-auto w-full gap-2 py-4 font-code-label uppercase hover:shadow-[0_0_20px_rgba(63,185,80,0.4)]"
        >
          {isSubmitting ? "Sending..." : contactContent.form.submitLabel}
          <Send className="size-4" />
        </Button>

        {statusMessage ? (
          <p className="font-body-md text-sm text-muted-foreground">
            {statusMessage}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
