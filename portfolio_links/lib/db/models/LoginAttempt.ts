import mongoose, { Schema, type InferSchemaType } from "mongoose";

const loginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  windowStart: { type: Date, required: true, default: Date.now },
  lockedUntil: { type: Date, default: null },
  // TTL index: Mongo drops the doc once expiresAt passes, so the collection
  // self-cleans and we never need a cron job for it.
  expiresAt: { type: Date, required: true, expires: 0 },
});

export type LoginAttemptDoc = InferSchemaType<typeof loginAttemptSchema> & {
  _id: mongoose.Types.ObjectId;
};

const LoginAttemptModel =
  (mongoose.models.LoginAttempt as mongoose.Model<LoginAttemptDoc>) ||
  mongoose.model<LoginAttemptDoc>("LoginAttempt", loginAttemptSchema);

export default LoginAttemptModel;
