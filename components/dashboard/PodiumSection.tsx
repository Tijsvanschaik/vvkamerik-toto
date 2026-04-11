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
    gradient: "from-yellow-400 to-amber-500",
    ring: "ring-yellow-300",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
    border: "border-yellow-200",
    textPts: "text-yellow-600",
    offset: "mt-0",
    ptSize: "text-xl sm:text-2xl",
    nameSize: "text-sm sm:text-base",
  },
  {
    prizeKey: "prize_2nd" as const,
    medal: "🥈",
    gradient: "from-gray-300 to-gray-400",
    ring: "ring-gray-200",
    bg: "bg-gradient-to-br from-gray-50 to-slate-50",
    border: "border-gray-200",
    textPts: "text-gray-500",
    offset: "mt-3 sm:mt-4",
    ptSize: "text-lg sm:text-xl",
    nameSize: "text-xs sm:text-sm",
  },
  {
    prizeKey: "prize_3rd" as const,
    medal: "🥉",
    gradient: "from-amber-600 to-amber-700",
    ring: "ring-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-200",
    textPts: "text-amber-700",
    offset: "mt-5 sm:mt-6",
    ptSize: "text-lg sm:text-xl",
    nameSize: "text-xs sm:text-sm",
  },
];

// Visual order: 2nd | 1st | 3rd
const VISUAL_ORDER = [1, 0, 2];

export default function PodiumSection({ top3, prizes, allFinished }: PodiumSectionProps) {
  if (top3.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">Top 3</p>
        <h2 className="text-xl font-bold text-gray-900">Podium</h2>
      </div>

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {VISUAL_ORDER.map((dataIdx) => {
            const entry = top3[dataIdx];
            const cfg = CONFIGS[dataIdx];

            if (!entry) return <div key={dataIdx} className="flex-1 max-w-[160px]" />;

            return (
              <div
                key={entry.participant_id}
                className={`flex-1 min-w-0 flex flex-col items-center ${cfg.offset}`}
              >
                {/* Medal badge */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${cfg.gradient} ring-2 ${cfg.ring} flex items-center justify-center mb-1.5 shadow-sm flex-shrink-0`}
                >
                  <span className="text-base sm:text-xl leading-none">{cfg.medal}</span>
                </div>

                {/* Card */}
                <div
                  className={`w-full rounded-xl border ${cfg.border} ${cfg.bg} px-2 py-2 sm:px-3 sm:py-3 text-center shadow-sm`}
                >
                  <p className={`font-black truncate text-gray-900 leading-tight ${cfg.nameSize}`}>
                    {entry.participant_name}
                  </p>
                  <p className={`font-black tabular-nums mt-0.5 ${cfg.ptSize} ${cfg.textPts}`}>
                    {entry.total_points}
                    <span className="text-[10px] font-normal text-gray-400 ml-0.5">pt</span>
                  </p>
                  {allFinished && (
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-0.5">
                      {fmt(prizes[cfg.prizeKey])}
                    </p>
                  )}
                </div>

                {/* Podium step */}
                <div
                  className={`w-full mt-1 rounded-b-lg bg-gradient-to-b ${cfg.gradient} opacity-30 ${
                    dataIdx === 0 ? "h-5" : dataIdx === 1 ? "h-3" : "h-1.5"
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
