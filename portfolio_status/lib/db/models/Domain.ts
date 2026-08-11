import mongoose, { Schema, type InferSchemaType } from "mongoose";

const domainSchema = new Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export type DomainDoc = InferSchemaType<typeof domainSchema> & {
  _id: mongoose.Types.ObjectId;
};

const DomainModel =
  (mongoose.models.Domain as mongoose.Model<DomainDoc>) ||
  mongoose.model<DomainDoc>("Domain", domainSchema);

export default DomainModel;
