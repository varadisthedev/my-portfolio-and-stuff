
import { checkHealth } from "../lib/healthchecker";

export default async function Home() {
  const services = await checkHealth();
  const healthyCount = services.filter((service) => service.status === "healthy").length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Global Status</p>
          <h1 className="text-3xl font-semibold">Service health check</h1>
          {/* <p className="text-slate-400">
            {healthyCount} of {services.length} services are healthy.
          </p> */}
        </header>

        <section className="grid gap-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-sm border border-slate-800 bg-slate-900/70 px-4 py-3 hover:bg-slate-200/10"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-slate-400">{service.url || "No URL provided"}</p>

              </div>
              <div className="flex flex-col items-center">

                <span
                  className={
                    service.status === "healthy" ? "rounded-sm bg-emerald-500/15 px-3 py-1 text-sm text-emerald-500"
                      : service.status === "missing_url"
                        ? "rounded-sm bg-amber-500/15 px-3 py-1 text-sm text-amber-500"
                        : service.status === "unhealthy"
                          ? "rounded-sm bg-rose-500/15 px-3 py-1 text-sm text-rose-600"
                          : "rounded-sm bg-slate-500/15 px-3 py-1 text-sm text-slate-500"
                  }
                >
                  {service.status}
                </span>
                <span className={service.latency >= 0 ? "text-xs text-emerald-400" : "text-xs text-rose-500"}>
                  latency: {service.latency} ms
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
