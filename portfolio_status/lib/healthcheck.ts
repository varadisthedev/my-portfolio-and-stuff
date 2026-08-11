import "server-only";
import connectToMongo from "@/lib/db/connect";
import DomainModel, { type DomainDoc } from "@/lib/db/models/Domain";
import StatusCheckModel from "@/lib/db/models/StatusCheck";

const REQUEST_TIMEOUT_MS = 10_000;

export interface CheckResult {
  domainId: string;
  status: "up" | "down";
  latencyMs: number | null;
  error: string | null;
}

async function pingDomain(domain: Pick<DomainDoc, "_id" | "url">): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetch(domain.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    const latencyMs = Date.now() - start;
    return {
      domainId: domain._id.toString(),
      status: response.ok ? "up" : "down",
      latencyMs,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      domainId: domain._id.toString(),
      status: "down",
      latencyMs: null,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function runAllChecks(): Promise<CheckResult[]> {
  await connectToMongo();
  const domains = await DomainModel.find().lean();

  const results = await Promise.all(domains.map((domain) => pingDomain(domain)));

  await StatusCheckModel.insertMany(
    results.map((result) => ({
      domain: result.domainId,
      status: result.status,
      latencyMs: result.latencyMs,
      error: result.error,
      checkedAt: new Date(),
    })),
  );

  return results;
}
