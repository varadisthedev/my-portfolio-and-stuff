import { SERVICES, type Service } from "./services";

interface HealthStatus {
  name: string;
  status: "healthy" | "unhealthy" | "missing_url";
  url: string | undefined;
  latency: number | -1;
}

// Then explicitly type the function:
export async function checkHealth(): Promise<HealthStatus[]> {
  console.log("Checking health of services...");
  console.log(typeof SERVICES);
  console.log(SERVICES);

  const healthStatuses = await Promise.all(
    SERVICES.map(async (service: Service) => {
      if (!service.url) {
        return {
          name: service.name,
          status: "missing_url",
          url: service.url,
          latency: -1,
        } as HealthStatus;
      }

      try {
        const start = Date.now();
        const response = await fetch(service.url); // assuming 200 status 
        const finalLatency = Date.now() - start;
        return {
          name: service.name,
          status: response.ok ? "healthy" : "unhealthy",
          url: service.url,
          latency: finalLatency
        } as HealthStatus;
      } catch (error) {
        return {
          name: service.name,
          status: "unhealthy",
          url: service.url,
          latency: -1,
        } as HealthStatus;
      }
    }),
  );

  return healthStatuses;
}


