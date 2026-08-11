import mongoose, { Schema, type InferSchemaType } from "mongoose";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

const statusCheckSchema = new Schema({
  domain: { type: Schema.Types.ObjectId, ref: "Domain", required: true, index: true },
  status: { type: String, enum: ["up", "down"], required: true },
  latencyMs: { type: Number, default: null },
  error: { type: String, default: null },
  checkedAt: { type: Date, default: Date.now, expires: THIRTY_DAYS_SECONDS },
});

statusCheckSchema.index({ domain: 1, checkedAt: -1 });

export type StatusCheckDoc = InferSchemaType<typeof statusCheckSchema> & {
  _id: mongoose.Types.ObjectId;
};

const StatusCheckModel =
  (mongoose.models.StatusCheck as mongoose.Model<StatusCheckDoc>) ||
  mongoose.model<StatusCheckDoc>("StatusCheck", statusCheckSchema);

export default StatusCheckModel;
