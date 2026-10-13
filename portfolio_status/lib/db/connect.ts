import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _statusMongoConn: Promise<typeof mongoose> | undefined;
}

export function connectToMongo(): Promise<typeof mongoose> {
  // Checked lazily: `next build` imports route modules without runtime env vars.
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not found in environment variables");
  }
  if (!global._statusMongoConn) {
    global._statusMongoConn = mongoose.connect(uri);
  }
  return global._statusMongoConn;
}

export default connectToMongo;
