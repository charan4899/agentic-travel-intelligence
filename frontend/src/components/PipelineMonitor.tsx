"use client";

import { useEffect, useState } from "react";

type IngestionRun = {
  id: number;
  job_name: string;
  source_name: string;
  status: string;
  records_fetched: number;
  records_inserted: number;
  started_at: string | null;
  ended_at: string | null;
  error_message: string | null;
};

type IngestionSummary = {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  latest_run_time: string | null;
  latest_status_by_job: Record<
    string,
    {
      status: string;
      started_at: string | null;
      records_fetched: number;
      records_inserted: number;
    }
  >;
};

export default function PipelineMonitor() {
  const [recentRuns, setRecentRuns] = useState<IngestionRun[]>([]);
  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [recentRes, summaryRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/ingestion/recent`),
          fetch(`${apiBaseUrl}/api/ingestion/summary`),
        ]);

        if (!recentRes.ok || !summaryRes.ok) {
          throw new Error("Failed to fetch ingestion monitor data.");
        }

        const recentData: IngestionRun[] = await recentRes.json();
        const summaryData: IngestionSummary = await summaryRes.json();

        setRecentRuns(recentData);
        setSummary(summaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonitorData();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 p-8 text-center text-slate-400">
        Loading pipeline monitor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total Runs
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.total_runs}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Successful Runs
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.successful_runs}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Failed Runs
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.failed_runs}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Latest Run
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {summary.latest_run_time
                ? new Date(summary.latest_run_time).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Fetched</th>
              <th className="px-4 py-3">Inserted</th>
              <th className="px-4 py-3">Started At</th>
            </tr>
          </thead>

          <tbody>
            {recentRuns.map((run) => (
              <tr
                key={run.id}
                className="border-t border-white/10 text-slate-300"
              >
                <td className="px-4 py-3">{run.job_name}</td>
                <td className="px-4 py-3">{run.source_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      run.status === "success"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : run.status === "failed"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-yellow-500/15 text-yellow-300"
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3">{run.records_fetched}</td>
                <td className="px-4 py-3">{run.records_inserted}</td>
                <td className="px-4 py-3">
                  {run.started_at
                    ? new Date(run.started_at).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}