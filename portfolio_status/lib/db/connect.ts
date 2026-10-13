import mongoose from "mongoose";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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

/**
 * One connection per request. Workers tie a socket to the request that opened
 * it: a connection cached across requests makes later requests await replies
 * that get delivered to a finished request, so they hang until the runtime
 * kills them. The request's ExecutionContext is the key (under `next dev` it's
 * a single shared object, which is fine on Node).
 */
const connections = new WeakMap<object, Promise<Db>>();

export function connectToMongo(): Promise<Db> {
  // Checked lazily: `next build` imports route modules without runtime env vars.
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not found in environment variables");
  }

  const { ctx } = getCloudflareContext();
  let db = connections.get(ctx);
  if (!db) {
    // ponytail: sockets are dropped when the request ends rather than closed; add
    // ctx.waitUntil(conn.close()) if Atlas connection counts ever climb.
    db = mongoose
      .createConnection(uri, { maxPoolSize: 1, serverSelectionTimeoutMS: 5000 })
      .asPromise()
      .then(bindModels);
    connections.set(ctx, db);
  }
  return db;
}

export default connectToMongo;
