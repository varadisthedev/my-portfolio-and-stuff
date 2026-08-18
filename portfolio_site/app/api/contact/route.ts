import { Resend } from "resend";
import chalk from "chalk";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
const log = console.log;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
if (!process.env.RESEND_API_KEY) {
    log(chalk.red("RESEND_API_KEY is not set in environment variables"));
    throw new Error("RESEND_API_KEY is not set in environment variables");
}
if (!process.env.MY_MAIL_RESEND) {
    log(chalk.red("MY_MAIL_RESEND is not set in environment variables"));
    throw new Error("MY_MAIL_RESEND is not set in environment variables");
}

const myMail = process.env.MY_MAIL_RESEND!;

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactBody = {
    name: string;
    email: string;
    subject?: string;
    message: string;
};

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rate = await checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
        if (!rate.allowed) {
            return Response.json(
                { error: "Too many messages sent recently. Please wait a bit before trying again." },
                { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
            );
        }

        const body: ContactBody = await req.json();

        const { name, email, subject, message } = body;
        if (!name || !email || !message) {
            return Response.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return Response.json(
                { error: "Invalid email" },
                { status: 400 }
            );
        }
        if (!name.trim() || !email.trim() || !message.trim()) {
            return Response.json(
                { error: "Fields cannot be empty" },
                { status: 400 }
            );
        } // doenst check for all whitespace but good enough for now
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: myMail,
            subject: subject?.trim()
                ? `${subject.trim()} - Portfolio Contact from ${name}`
                : `Portfolio Contact from ${name}`,
            replyTo: email,
            text: `From: ${name} <${email}>\n\n${message}`,
        });
        log(chalk.green("Email sent"))

        return Response.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        log(chalk.red("Failed to send email"));
        console.log(error);
        return Response.json(
            { success: false },
            { status: 500 }
        );
    }
}