"use client";

import { useEffect, useState } from "react";
import BudgetComparison from "@/components/BudgetComparison";
import AgentChat from "@/components/AgentChat";

type DestinationCard = {
  destination_city: string;
  total_cost_usd?: number;
  weather_score?: number;
  weather_condition?: string;
  value_score?: number;
};

type SummaryResponse = {
  trip_days: number;
  cheapest_destination: DestinationCard | null;
  best_weather_destination: DestinationCard | null;
  best_value_destination: DestinationCard | null;
  most_expensive_destination: DestinationCard | null;
};

const ALL_DESTINATIONS = ["New York", "London", "Sydney", "Tokyo"];

function SummaryCard({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm transition hover:border-cyan-400/20 hover:bg-white/[0.06]">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>
  );
}

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [tripDays, setTripDays] = useState(5);
  const [selectedDestinations, setSelectedDestinations] =
    useState<string[]>(ALL_DESTINATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const destinationParam =
          selectedDestinations.length > 0
            ? `&destinations=${encodeURIComponent(selectedDestinations.join(","))}`
            : "";

        const response = await fetch(
          `${apiBaseUrl}/api/destinations/summary?trip_days=${tripDays}${destinationParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch destination summaries.");
        }

        const data: SummaryResponse = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [apiBaseUrl, tripDays, selectedDestinations]);

  const toggleDestination = (destination: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(destination)
        ? prev.filter((item) => item !== destination)
        : [...prev, destination]
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.10),_transparent_28%),linear-gradient(to_bottom,_#020617,_#020617)] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">
              Agentic Travel Intelligence Platform
            </p>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Real-time travel pricing, destination comparison, and AI-powered
              travel intelligence.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Compare trip budgets across destinations using flight prices,
              hotel prices, weather conditions, and an agentic query layer built
              on top of a structured travel intelligence backend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Origin: Hyderabad (HYD)",
                "FastAPI",
                "PostgreSQL",
                "Next.js",
                "Agentic APIs",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Destination Insights
              </h2>
              <p className="mt-2 text-slate-400">
                Live summary cards powered by backend intelligence APIs.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                All budget estimates are based on departures from Hyderabad
                (HYD).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="tripDays" className="text-sm text-slate-400">
                Trip Length
              </label>
              <select
                id="tripDays"
                value={tripDays}
                onChange={(e) => setTripDays(Number(e.target.value))}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none"
              >
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
                <option value={10}>10 Days</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400">Destinations</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {ALL_DESTINATIONS.map((destination) => {
                const isSelected = selectedDestinations.includes(destination);

                return (
                  <button
                    key={destination}
                    type="button"
                    onClick={() => toggleDestination(destination)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    {destination}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-400">
            Loading destination summaries...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && summary && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <SummaryCard
              label="Cheapest Destination"
              title={summary.cheapest_destination?.destination_city ?? "N/A"}
              subtitle={`Total Cost: $${
                summary.cheapest_destination?.total_cost_usd?.toFixed(2) ?? "N/A"
              }`}
            />

            <SummaryCard
              label="Best Weather"
              title={summary.best_weather_destination?.destination_city ?? "N/A"}
              subtitle={`Weather: ${
                summary.best_weather_destination?.weather_condition ?? "N/A"
              }`}
            />

            <SummaryCard
              label="Best Value"
              title={summary.best_value_destination?.destination_city ?? "N/A"}
              subtitle={`Value Score: ${
                summary.best_value_destination?.value_score ?? "N/A"
              }`}
            />

            <SummaryCard
              label="Most Expensive"
              title={summary.most_expensive_destination?.destination_city ?? "N/A"}
              subtitle={`Total Cost: $${
                summary.most_expensive_destination?.total_cost_usd?.toFixed(2) ??
                "N/A"
              }`}
            />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] xl:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Budget Comparison
            </h2>
            <p className="mt-2 text-slate-400">
              Compare total estimated trip budgets across destinations for a{" "}
              {tripDays}-day trip.
            </p>

            <div className="mt-6">
              <BudgetComparison
                tripDays={tripDays}
                selectedDestinations={selectedDestinations}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Travel Agent
            </h2>
            <p className="mt-2 text-slate-400">
              Ask natural-language travel questions and get intelligence-backed
              answers.
            </p>

            <div className="mt-6">
              <AgentChat 
              tripDays={tripDays}
              selectedDestinations={selectedDestinations}
               />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
            Built For
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Travel planning, pricing intelligence, and agentic analytics
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            This platform combines structured travel datasets, operational data
            pipelines, budget estimation, and an intelligent query layer into a
            single end-to-end analytics product.
          </p>
        </div>
      </section>
    </main>
  );
}