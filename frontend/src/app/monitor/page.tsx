import PipelineMonitor from "@/components/PipelineMonitor";

export default function MonitorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
            System Observability
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Pipeline Monitor
          </h1>

          <p className="mt-6 max-w-3xl text-base text-slate-300">
            This page shows ingestion pipeline health, job history,
            and operational metrics for the travel intelligence platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <PipelineMonitor />
      </section>
    </main>
  );
}