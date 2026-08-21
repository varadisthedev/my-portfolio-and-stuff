import mongoose from "mongoose";

// Persists every contact-form submission independent of Resend, so a send
// that silently fails on Resend's side (e.g. sandbox domain restrictions)
// still leaves a durable record with the failure reason instead of vanishing.
const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    ip: { type: String },
    status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        required: true,
        default: "pending",
    },
    resendId: { type: String },
    error: { type: String },
}, { timestamps: true });

const ContactMessage =
    mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
