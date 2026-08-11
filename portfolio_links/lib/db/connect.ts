import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string;
if (!URI) {
  throw new Error("MONGO_URI not found in environment variables");
}

declare global {
  var _linksMongoConn: Promise<typeof mongoose> | undefined;
}

export function connectToMongo(): Promise<typeof mongoose> {
  if (!global._linksMongoConn) {
    global._linksMongoConn = mongoose.connect(URI);
  }
  return global._linksMongoConn;
}

export default connectToMongo;
