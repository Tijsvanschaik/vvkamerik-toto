"use client";

import type { LeaderboardEntry } from "@/lib/types";

interface PodiumSectionProps {
  top3: LeaderboardEntry[];
  prizes: { prize_1st: number; prize_2nd: number; prize_3rd: number };
  allFinished: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const CONFIGS = [
  {
    prizeKey: "prize_1st" as const,
    medal: "🥇",
    label: "1e",
    gradient: "from-yellow-400 to-amber-500",
    ring: "ring-yellow-300",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
    border: "border-yellow-200",
    textPts: "text-yellow-600",
    size: "scale-100",
    offset: "mt-0",
  },
  {
    prizeKey: "prize_2nd" as const,
    medal: "🥈",
    label: "2e",
    gradient: "from-gray-300 to-gray-400",
    ring: "ring-gray-200",
    bg: "bg-gradient-to-br from-gray-50 to-slate-50",
    border: "border-gray-200",
    textPts: "text-gray-500",
    size: "scale-95",
    offset: "mt-4",
  },
  {
    prizeKey: "prize_3rd" as const,
    medal: "🥉",
    label: "3e",
    gradient: "from-amber-600 to-amber-700",
    ring: "ring-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-200",
    textPts: "text-amber-700",
    size: "scale-90",
    offset: "mt-6",
  },
];

// Visual order: 2nd | 1st | 3rd
const VISUAL_ORDER = [1, 0, 2];

export default function PodiumSection({ top3, prizes, allFinished }: PodiumSectionProps) {
  if (top3.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">Top 3</p>
          <h2 className="text-xl font-bold text-gray-900">Podium</h2>
        </div>
        {allFinished && (
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            ✓ Eindstand
          </span>
        )}
      </div>

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {VISUAL_ORDER.map((dataIdx) => {
            const entry = top3[dataIdx];
            const cfg = CONFIGS[dataIdx];

            if (!entry) return <div key={dataIdx} className="flex-1 max-w-[160px]" />;

            const isFirst = dataIdx === 0;

            return (
              <div
                key={entry.participant_id}
                className={`flex-1 max-w-[160px] flex flex-col items-center ${cfg.offset}`}
              >
                {/* Medal badge */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${cfg.gradient} ring-2 ${cfg.ring} flex items-center justify-center mb-2 shadow-sm`}
                >
                  <span className="text-xl leading-none">{cfg.medal}</span>
                </div>

                {/* Card */}
                <div
                  className={`w-full rounded-2xl border ${cfg.border} ${cfg.bg} px-3 py-3 text-center shadow-sm ${
                    isFirst ? "shadow-md" : ""
                  }`}
                >
                  <p
                    className={`font-black truncate text-gray-900 leading-tight ${
                      isFirst ? "text-base" : "text-sm"
                    }`}
                  >
                    {entry.participant_name}
                  </p>
                  <p className={`font-black tabular-nums mt-1 ${isFirst ? "text-2xl" : "text-xl"} ${cfg.textPts}`}>
                    {entry.total_points}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                  </p>
                  {allFinished && (
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      {fmt(prizes[cfg.prizeKey])}
                    </p>
                  )}
                </div>

                {/* Podium block */}
                <div
                  className={`w-full mt-1.5 rounded-b-lg bg-gradient-to-b ${cfg.gradient} opacity-30 ${
                    isFirst ? "h-6" : dataIdx === 1 ? "h-4" : "h-2"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
