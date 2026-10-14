import mongoose from "mongoose";
import { domainSchema, type DomainDoc } from "@/lib/db/models/Domain";
import { rateLimitSchema, type RateLimitDoc } from "@/lib/db/models/RateLimit";
import { statusCheckSchema, type StatusCheckDoc } from "@/lib/db/models/StatusCheck";

function bindModels(conn: mongoose.Connection) {
  return {
    Domain: conn.model<DomainDoc>("Domain", domainSchema),
    RateLimit: conn.model<RateLimitDoc>("RateLimit", rateLimitSchema),
    StatusCheck: conn.model<StatusCheckDoc>("StatusCheck", statusCheckSchema),
  };
}

export type Db = ReturnType<typeof bindModels>;

declare global {
  // Survives hot reloads in dev and is reused across invocations of a warm function.
  var _statusDb: Promise<Db> | undefined;
}

export function connectToMongo(): Promise<Db> {
  // Checked lazily: `next build` imports route modules without runtime env vars.
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not found in environment variables");
  }

  if (!global._statusDb) {
    global._statusDb = mongoose
      .createConnection(uri, { serverSelectionTimeoutMS: 5000 })
      .asPromise()
      .then(bindModels)
      .catch((error) => {
        // Don't cache a failed connect, or every later request fails with it too.
        global._statusDb = undefined;
        throw error;
      });
  }
  return global._statusDb;
}

export default connectToMongo;
