"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import ParticipantDetail from "@/components/leaderboard/ParticipantDetail";

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

const rankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-700";
  return "text-gray-300";
};

export default function RankingTable({ entries }: RankingTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
          Standen
        </p>
        <h2 className="text-xl font-bold text-gray-900">Ranglijst</h2>
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-base text-gray-400">
            De ranglijst is zichtbaar zodra de eerste wedstrijd is gespeeld.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry) => (
            <div key={entry.participant_id}>
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === entry.participant_id ? null : entry.participant_id
                  )
                }
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
              >
                {/* Rank */}
                <span className={`text-sm font-black w-6 text-center flex-shrink-0 ${rankColor(entry.rank)}`}>
                  {entry.rank}
                </span>

                {/* Name */}
                <span className="flex-1 font-semibold text-gray-900 truncate min-w-0 text-base">
                  {entry.participant_name}
                </span>

                {/* Payment badge */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    entry.has_paid
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-400"
                  }`}
                >
                  {entry.has_paid ? "betaald" : "open"}
                </span>

                {/* Points */}
                <span className="font-black text-[#1e3a8a] tabular-nums text-base min-w-[3rem] text-right flex-shrink-0">
                  {entry.total_points}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                </span>

                {/* Expand indicator */}
                <span className="text-gray-300 text-xs flex-shrink-0">
                  {expandedId === entry.participant_id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === entry.participant_id && (
                <div className="bg-gray-50 border-t border-gray-100">
                  <ParticipantDetail matchPoints={entry.match_points} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
