import { z } from "zod";

/** "example.com/health" → "https://example.com/health"; explicit http:// or https:// is kept. */
export function withDefaultScheme(value: string): string {
  const trimmed = value.trim();
  return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const domainUrlSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? withDefaultScheme(value) : value),
  z.url({ protocol: /^https?$/, error: "Must be a valid URL, e.g. example.com/health" }),
);
