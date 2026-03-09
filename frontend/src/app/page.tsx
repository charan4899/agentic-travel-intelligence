"use client";

import { useEffect, useState } from "react";
import BudgetComparison from "@/components/BudgetComparison";
import FloatingAgent from "@/components/FloatingAgent";

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

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 3H16V6C16 8.20914 14.2091 10 12 10C9.79086 10 8 8.20914 8 6V3Z"
        fill="currentColor"
      />
      <path
        d="M6 4H4C4 6.76142 6.23858 9 9 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 4H20C20 6.76142 17.7614 9 15 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 10V15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 21H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 15H14L15 21H9L10 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 19V22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 12H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 12H22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.93 4.93L7.05 7.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.95 16.95L19.07 19.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.07 4.93L16.95 7.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.05 16.95L4.93 19.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4H17L21 9L12 20L3 9L7 4Z" fill="currentColor" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z"
        fill="currentColor"
      />
      <circle cx="16.5" cy="12" r="1.2" fill="#020617" />
    </svg>
  );
}

function SummaryCard({
  label,
  title,
  subtitle,
  accent,
  icon,
  iconColor,
}: {
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent} opacity-80`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 ${iconColor}`}
        >
          {icon}
        </div>
      </div>

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(to_bottom,_#020617,_#020617)] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="max-w-5xl">
            <p className="text-lg font-semibold uppercase tracking-[0.28em] text-cyan-400 sm:text-xl">
              Agentic Travel Intelligence Platform
            </p>

            <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">
              Smarter destination planning with analytics, AI, and live travel intelligence.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Explore destination affordability, compare trip budgets, and ask
              natural-language travel questions powered by analytics APIs and
              an LLM-enhanced assistant.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["FastAPI", "PostgreSQL", "Next.js", "Groq Llama-3"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Destination Insights
                </h2>
                <p className="mt-2 text-slate-400">
                  Live summary cards powered by backend intelligence APIs.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  Origin: Hyderabad (HYD)
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  All budget estimates are calculated based on departures from Hyderabad.
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
              <p className="text-sm text-slate-300">Destination Filters</p>
              <p className="mt-1 text-sm text-slate-500">
                Select the required destinations from the available cities below to refine insights and budget comparison.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {ALL_DESTINATIONS.map((destination) => {
                  const isSelected = selectedDestinations.includes(destination);

                  return (
                    <button
                      key={destination}
                      type="button"
                      onClick={() => toggleDestination(destination)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
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
              accent="bg-emerald-400"
              icon={<TrophyIcon />}
              iconColor="text-emerald-300"
            />

            <SummaryCard
              label="Best Weather"
              title={summary.best_weather_destination?.destination_city ?? "N/A"}
              subtitle={`Weather: ${
                summary.best_weather_destination?.weather_condition ?? "N/A"
              }`}
              accent="bg-sky-400"
              icon={<SunIcon />}
              iconColor="text-sky-300"
            />

            <SummaryCard
              label="Best Value"
              title={summary.best_value_destination?.destination_city ?? "N/A"}
              subtitle={`Value Score: ${
                summary.best_value_destination?.value_score ?? "N/A"
              }`}
              accent="bg-cyan-400"
              icon={<DiamondIcon />}
              iconColor="text-cyan-300"
            />

            <SummaryCard
              label="Most Expensive"
              title={summary.most_expensive_destination?.destination_city ?? "N/A"}
              subtitle={`Total Cost: $${
                summary.most_expensive_destination?.total_cost_usd?.toFixed(2) ??
                "N/A"
              }`}
              accent="bg-rose-400"
              icon={<WalletIcon />}
              iconColor="text-rose-300"
            />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:py-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Budget Comparison
              </h2>
              <p className="mt-2 text-slate-400">
                Compare total estimated trip budgets across the selected destinations.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Active Trip Length
              </p>
              <p className="mt-1 text-lg font-semibold text-cyan-300">
                {tripDays} Days
              </p>
            </div>
          </div>

          <div className="mt-6">
            <BudgetComparison
              tripDays={tripDays}
              selectedDestinations={selectedDestinations}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
            Why This Platform
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Travel planning, pricing intelligence, and AI-powered exploration
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            This platform combines structured travel analytics, cloud-hosted APIs,
            dynamic dashboard interactions, and LLM-enhanced reasoning into a
            single end-to-end product experience.
          </p>
        </div>
      </section>

      <FloatingAgent
        tripDays={tripDays}
        selectedDestinations={selectedDestinations}
      />
    </main>
  );
}