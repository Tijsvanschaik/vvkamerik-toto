"use client";

import type { LeaderboardEntry } from "@/lib/types";

interface PodiumSectionProps {
  top3: LeaderboardEntry[];
  prizes: { prize_1st: number; prize_2nd: number; prize_3rd: number };
  allFinished: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const HEIGHTS = ["h-36 sm:h-44", "h-28 sm:h-36", "h-24 sm:h-28"];
const COLORS = [
  "bg-gradient-to-b from-yellow-50 to-yellow-100 border-2 border-yellow-300",
  "bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-300",
  "bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300",
];
const ORDER = [1, 0, 2]; // visual order: 2nd, 1st, 3rd

const PRIZES = ["prize_1st", "prize_2nd", "prize_3rd"] as const;

export default function PodiumSection({ top3, prizes, allFinished }: PodiumSectionProps) {
  if (top3.length === 0) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#1b5e20] px-5 py-4 flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <h2 className="text-white font-bold text-lg tracking-wide">Podium</h2>
      </div>
      <div className="px-4 py-6">
        <div className="flex items-end justify-center gap-2 sm:gap-4">
          {ORDER.map((dataIdx) => {
            const entry = top3[dataIdx];
            if (!entry) return <div key={dataIdx} className="w-24 sm:w-32" />;
            const visualPos = ORDER.indexOf(dataIdx);
            return (
              <div key={entry.participant_id} className="flex flex-col items-center flex-1 max-w-[120px] sm:max-w-[160px]">
                <div className="text-2xl mb-1">{MEDALS[dataIdx]}</div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 text-center truncate w-full px-1 mb-1">
                  {entry.participant_name}
                </p>
                <p className="text-lg sm:text-2xl font-black text-[#1b5e20] mb-1">
                  {entry.total_points}
                  <span className="text-xs font-medium text-gray-400 ml-1">pt</span>
                </p>
                {allFinished && (
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {fmt(prizes[PRIZES[dataIdx]])}
                  </p>
                )}
                <div className={`w-full rounded-t-xl flex items-center justify-center ${HEIGHTS[visualPos]} ${COLORS[dataIdx]}`}>
                  <span className="text-3xl sm:text-4xl font-black text-gray-300/60">
                    {dataIdx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
