"use client";

import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactContent } from "@/lib/site";
import { cn } from "@/lib/utils";

const fieldClassName = cn(
  "h-11 rounded-lg border-outline-variant bg-[#050505] px-3 font-body-md text-foreground transition-all duration-200",
  "placeholder:text-muted-foreground/60",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:shadow-[0_0_0_1px_rgba(63,185,80,0.25)]"
);

const labelClassName = "font-code-label uppercase text-muted-foreground";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
              onClick={() => {
                // No-op for now — will send the current message to an LLM
                // to clean up phrasing/grammar without changing its tone.
              }}
              className="flex items-center gap-1.5 border border-outline-variant/60 px-2 py-1 font-code-label text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Sparkles className="size-3" />
              AI
            </button>
          </div>
          <Textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Keep it brief or rough — tap AI above to clean up the wording without changing your tone."
            className={cn(fieldClassName, "min-h-40 resize-y py-3")}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
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
