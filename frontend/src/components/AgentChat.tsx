"use client";

import { useState } from "react";

type SourceUsed = {
  source_type: string;
  source_name: string;
  relevance_score: number;
};

type AgentResponse = {
  intent: string;
  trip_days: number;
  confidence_score: number;
  sources_used: SourceUsed[];
  answer: string;
  data: unknown;
  llm_used?: boolean;
  llm_provider?: string | null;
  llm_model?: string | null;
};

type AgentChatProps = {
  tripDays: number;
  selectedDestinations: string[];
};

export default function AgentChat({ tripDays, selectedDestinations, }: AgentChatProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;
    const hasTripDaysInQuery = /\b\d+\s*-\s*day\b|\b\d+\s*day\b/i.test(query);
    const finalQuery = hasTripDaysInQuery
    ? query
    : `${query.trim()} for a ${tripDays}-day trip`;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/agent/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: finalQuery, selected_destinations: selectedDestinations, }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch agent response.");
      }

      const data: AgentResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a travel question, for example: Which destination is cheapest for a 5-day trip?"
          className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Powered by travel data, scoring logic, and LLM-enhanced explanations. Current dashboard trip length: {tripDays} days. Active destinations: {selectedDestinations.join(", ")}.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Ask Agent"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.llm_used
                  ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                  : "border border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
              }`}
            >
              {result.llm_used ? "LLM Enhanced" : "Fallback Mode"}
            </span>

            {result.llm_provider && (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                Provider: {result.llm_provider}
              </span>
            )}

            {result.llm_model && (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                Model: {result.llm_model}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
            <p className="text-sm text-slate-400">Agent Answer</p>
            <p className="mt-2 text-base leading-7 text-white">{result.answer}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Intent
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {result.intent}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Trip Days
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {result.trip_days}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Confidence
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {result.confidence_score}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400">Sources Used</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.sources_used.map((source) => (
                <span
                  key={`${source.source_type}-${source.source_name}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
                >
                  {source.source_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}