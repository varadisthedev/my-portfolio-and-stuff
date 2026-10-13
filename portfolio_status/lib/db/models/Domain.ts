import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const domainSchema = new Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export type DomainDoc = InferSchemaType<typeof domainSchema> & {
  _id: mongoose.Types.ObjectId;
};
