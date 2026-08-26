import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * Fixed-window counter. One document per key; the TTL index drops it when the
 * window closes, so old windows never need sweeping by hand.
 */
const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});

export type RateLimitDoc = InferSchemaType<typeof rateLimitSchema> & {
  _id: mongoose.Types.ObjectId;
};

const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<RateLimitDoc>) ||
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);

export default RateLimitModel;
