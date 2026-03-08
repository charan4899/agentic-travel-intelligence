"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Destination = {
  destination_city: string;
  flight_cost_usd: number;
  hotel_cost_usd: number;
  total_cost_usd: number;
};

type CompareResponse = {
  trip_days: number;
  destinations: Destination[];
};

type BudgetComparisonProps = {
  tripDays: number;
  selectedDestinations: string[];
};

export default function BudgetComparison({
  tripDays,
  selectedDestinations,
}: BudgetComparisonProps) {
  const [data, setData] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const destinationParam =
          selectedDestinations.length > 0
            ? `&destinations=${encodeURIComponent(selectedDestinations.join(","))}`
            : "";

        const res = await fetch(
          `${apiBaseUrl}/api/budget/compare?trip_days=${tripDays}${destinationParam}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch budget comparison data.");
        }

        const json: CompareResponse = await res.json();
        setData(json.destinations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl, tripDays, selectedDestinations]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-10 text-center text-slate-400">
        Loading comparison data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-10 text-center text-slate-400">
        No destinations selected.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/[0.03]">
            <tr className="text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Flight Cost</th>
              <th className="px-4 py-3 font-medium">Hotel Cost</th>
              <th className="px-4 py-3 font-medium">Total Cost</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr
                key={d.destination_city}
                className="border-t border-white/10 text-slate-300"
              >
                <td className="px-4 py-4 font-medium text-white">
                  {d.destination_city}
                </td>
                <td className="px-4 py-4">${d.flight_cost_usd.toFixed(2)}</td>
                <td className="px-4 py-4">${d.hotel_cost_usd.toFixed(2)}</td>
                <td className="px-4 py-4 font-semibold text-cyan-300">
                  ${d.total_cost_usd.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="destination_city" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="total_cost_usd"
                fill="#06b6d4"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}