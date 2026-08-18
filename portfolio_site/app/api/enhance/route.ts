import chalk from "chalk";
import { enhanceMessage, MAX_MESSAGE_LENGTH } from "@/lib/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const log = console.log;

const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type EnhanceBody = {
    message?: string;
};

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rate = await checkRateLimit(`enhance:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
        if (!rate.allowed) {
            return Response.json(
                { error: "Too many requests. Please wait a bit before trying again." },
                { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
            );
        }

        const body: EnhanceBody = await req.json();
        const message = body.message?.trim();

        if (!message) {
            return Response.json({ error: "Message is required" }, { status: 400 });
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            return Response.json(
                { error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)` },
                { status: 400 }
            );
        }

        const enhanced = await enhanceMessage(message);
        return Response.json({ success: true, message: enhanced });
    } catch (error) {
        log(chalk.red("Failed to enhance message"));
        console.log(error);
        return Response.json(
            { error: "Unable to enhance the message right now. Please try again." },
            { status: 500 }
        );
    }
}
