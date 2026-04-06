"use client";

import type { LeaderboardEntry } from "@/lib/types";

interface PodiumSectionProps {
  top3: LeaderboardEntry[];
  prizes: { prize_1st: number; prize_2nd: number; prize_3rd: number };
  allFinished: boolean;
}

const PRIZE_KEYS = ["prize_1st", "prize_2nd", "prize_3rd"] as const;
const VISUAL_ORDER = [1, 0, 2]; // center=1st, left=2nd, right=3rd
const HEIGHTS = ["h-32 sm:h-40", "h-24 sm:h-32", "h-20 sm:h-24"];
const RANK_LABELS = ["1", "2", "3"];
const RANK_COLORS = [
  "border-yellow-300 bg-yellow-50",
  "border-gray-200 bg-gray-50",
  "border-amber-200 bg-amber-50",
];
const RANK_TEXT = ["text-yellow-500", "text-gray-400", "text-amber-700"];

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

export default function PodiumSection({ top3, prizes, allFinished }: PodiumSectionProps) {
  if (top3.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
          Top 3
        </p>
        <h2 className="text-xl font-bold text-gray-900">Podium</h2>
      </div>

      <div className="px-6 py-8">
        <div className="flex items-end justify-center gap-3">
          {VISUAL_ORDER.map((dataIdx) => {
            const entry = top3[dataIdx];
            if (!entry) return <div key={dataIdx} className="flex-1 max-w-[140px]" />;

            return (
              <div key={entry.participant_id} className="flex flex-col items-center flex-1 max-w-[140px]">
                {/* Name + points above pillar */}
                <p className="text-xs font-bold text-gray-700 text-center truncate w-full px-1 mb-1">
                  {entry.participant_name}
                </p>
                <p className={`text-xl font-black mb-0.5 ${dataIdx === 0 ? "text-[#1e3a8a]" : "text-gray-600"}`}>
                  {entry.total_points}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                </p>
                {allFinished && (
                  <p className="text-xs text-gray-400 mb-1.5">
                    {fmt(prizes[PRIZE_KEYS[dataIdx]])}
                  </p>
                )}

                {/* Pillar */}
                <div
                  className={`w-full rounded-t-xl border-2 flex items-start justify-center pt-2 ${HEIGHTS[VISUAL_ORDER.indexOf(dataIdx)]} ${RANK_COLORS[dataIdx]}`}
                >
                  <span className={`text-2xl font-black ${RANK_TEXT[dataIdx]}`}>
                    {RANK_LABELS[dataIdx]}
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
