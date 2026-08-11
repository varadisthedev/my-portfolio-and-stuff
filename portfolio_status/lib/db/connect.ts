import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string;
if (!URI) {
  throw new Error("MONGO_URI not found in environment variables");
}

declare global {
  // eslint-disable-next-line no-var
  var _statusMongoConn: Promise<typeof mongoose> | undefined;
}

export function connectToMongo(): Promise<typeof mongoose> {
  if (!global._statusMongoConn) {
    global._statusMongoConn = mongoose.connect(URI);
  }
  return global._statusMongoConn;
}

export default connectToMongo;
