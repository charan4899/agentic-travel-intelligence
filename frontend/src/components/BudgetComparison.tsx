"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
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

const BAR_COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: Destination;
  }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="text-slate-300">
          Flight: <span className="font-medium text-white">${data.flight_cost_usd.toFixed(2)}</span>
        </p>
        <p className="text-slate-300">
          Hotel: <span className="font-medium text-white">${data.hotel_cost_usd.toFixed(2)}</span>
        </p>
        <p className="text-cyan-300">
          Total: <span className="font-semibold">${data.total_cost_usd.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}

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

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-slate-950/30 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Visual Comparison
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Total trip cost by destination
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Scope
            </p>
            <p className="mt-1 text-sm font-medium text-cyan-300">
              {data.length} destination{data.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="h-84 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="destination_city"
                stroke="#94A3B8"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                stroke="#94A3B8"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={<CustomTooltip />}
              />

              <Bar dataKey="total_cost_usd" radius={[12, 12, 4, 4]} barSize={52}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.destination_city}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}