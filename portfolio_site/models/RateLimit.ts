import mongoose from "mongoose";

// Fixed-window counter, one document per `key` (route + client IP). Mongo,
// not an in-memory Map, because serverless functions don't share memory
// across invocations/instances — an in-memory limiter would silently reset
// on every cold start and let a caller hit a different warm instance for
// each request, defeating the point.
const rateLimitSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    windowStart: { type: Date, required: true },
});

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);
export default RateLimit;
