import mongoose, { Schema, type InferSchemaType } from "mongoose";

const linkSchema = new Schema({
  platform: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  order: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export type LinkDoc = InferSchemaType<typeof linkSchema> & {
  _id: mongoose.Types.ObjectId;
};

const LinkModel =
  (mongoose.models.Link as mongoose.Model<LinkDoc>) ||
  mongoose.model<LinkDoc>("Link", linkSchema);

export default LinkModel;
