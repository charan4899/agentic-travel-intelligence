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
  compact?: boolean;
};

export default function AgentChat({
  tripDays,
  selectedDestinations,
  compact = false,
}: AgentChatProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
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
      setSubmittedQuery(finalQuery);

      const response = await fetch(`${apiBaseUrl}/api/agent/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: finalQuery,
          selected_destinations: selectedDestinations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch agent response.");
      }

      const data: AgentResponse = await response.json();
      setResult(data);
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? "text-sm" : ""}`}>
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
            {tripDays}-day context
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
            {selectedDestinations.join(", ")}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
        {!submittedQuery && !result && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
            Ask a question like “Which destination is cheapest?” or “Which city has the best weather?”
          </div>
        )}

        {submittedQuery && (
          <div className="flex justify-end">
            <div className="max-w-[90%] rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950 shadow-[0_10px_20px_rgba(6,182,212,0.15)]">
              {submittedQuery}
            </div>
          </div>
        )}

        {(loading || result) && (
          <div className="flex justify-start">
            <div className="max-w-[95%] rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center gap-2">
                {loading ? (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    Thinking...
                  </span>
                ) : (
                  <>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        result?.llm_used
                          ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                          : "border border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
                      }`}
                    >
                      {result?.llm_used ? "LLM Enhanced" : "Fallback Mode"}
                    </span>

                    {result?.llm_provider && (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {result.llm_provider}
                      </span>
                    )}

                    {result?.llm_model && (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {result.llm_model}
                      </span>
                    )}
                  </>
                )}
              </div>

              {loading ? (
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3 w-3/5 rounded-full bg-white/10" />
                  <div className="h-3 w-2/3 rounded-full bg-white/10" />
                </div>
              ) : (
                result && (
                  <>
                    <p className="mt-4 text-sm leading-7 text-white">
                      {result.answer}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Intent
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {result.intent}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Trip Days
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {result.trip_days}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Confidence
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {result.confidence_score}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Sources Used
                      </p>
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
                  </>
                )
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about affordability, weather, or destination value..."
          className={`w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 ${
            compact ? "min-h-[96px]" : "min-h-[120px]"
          }`}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            The assistant uses dashboard context, analytics, and LLM-enhanced explanations.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}