import chalk from "chalk";

const log = console.log;

if (!process.env.GEMINI_API_KEY) {
    log(chalk.red("GEMINI_API_KEY is not set in environment variables"));
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export const MAX_MESSAGE_LENGTH = 3000;

// Deliberately narrow: light copy-editing, not a rewrite. The "generate
// properly if it's just a rough fragment" carve-out is the one place it's
// allowed to add structure, but never new specifics the person didn't
// mention — a two-word message shouldn't come back inventing a project name
// or a deadline.
const SYSTEM_PROMPT = `You lightly edit a short message someone is about to send through the contact form on a developer's portfolio site.

Fix spelling, grammar, and awkward phrasing so it reads smoothly. Keep the same meaning, tone, and every point the person made. Do not add claims, details, names, or requests they did not mention, and do not drop anything they said. Do not exaggerate or make it sound more formal or more enthusiastic than the original.

Formatting rules, no exceptions:
- No emojis.
- No em dashes or en dashes. Use plain periods and commas only.
- No markdown or formatting of any kind: no asterisks, no bullet points, no headers, no quotation marks wrapping the message.
- Plain sentences only.

If the message is only a few words or a rough, typo-filled fragment, write it out as a short, complete, natural message that clearly expresses the same intent. Still do not invent specifics beyond what's implied.

Reply with only the improved message text and nothing else — no preamble, no explanation, no labels.`;

function sanitize(text: string): string {
    return text
        // Defense in depth in case the model slips one in anyway.
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/\s*[—–]\s*/g, ". ")
        .replace(/\.\s*\./g, ".")
        .replace(/[*_#`]/g, "")
        .replace(/^["']|["']$/g, "")
        .replace(/[ \t]+/g, " ")
        .trim();
}

export async function enhanceMessage(message: string): Promise<string> {
    const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: {
                temperature: 0.4,
                // Generous relative to the actual reply length: this model
                // spends a chunk of the same token budget "thinking" before
                // it writes the reply (several hundred tokens even for a
                // one-line input, observed directly against the API), and a
                // low ceiling here truncates the real output (finishReason
                // MAX_TOKENS) rather than the thinking. Capping the
                // thinking budget instead (`thinkingConfig.thinkingBudget`)
                // was tried and didn't reliably reduce it, so headroom here
                // is the more reliable fix.
                maxOutputTokens: 2000,
            },
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Gemini request failed: ${response.status} ${body}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text: string | undefined = candidate?.content?.parts?.[0]?.text;
    if (!text || !text.trim()) {
        throw new Error("Gemini returned an empty response");
    }
    if (candidate?.finishReason === "MAX_TOKENS") {
        // Rather than silently hand back a reply that was cut off mid-
        // thought, fail loudly enough for the route to report a normal
        // "try again" error instead.
        throw new Error("Gemini response was truncated (MAX_TOKENS)");
    }

    return sanitize(text);
}
