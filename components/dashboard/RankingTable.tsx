"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import ParticipantDetail from "@/components/leaderboard/ParticipantDetail";

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

export default function RankingTable({ entries }: RankingTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#1b5e20] px-5 py-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          <h2 className="text-white font-bold text-lg tracking-wide">Ranglijst</h2>
        </div>
        <div className="py-12 text-center text-gray-400">
          <p>Het leaderboard is beschikbaar zodra de eerste wedstrijd is gespeeld.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#1b5e20] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <h2 className="text-white font-bold text-lg tracking-wide">Ranglijst</h2>
        </div>
        <span className="text-green-200 text-sm">{entries.length} deelnemers</span>
      </div>

      <div className="divide-y divide-gray-50">
        {entries.map((entry) => (
          <div key={entry.participant_id}>
            <button
              onClick={() =>
                setExpandedId(
                  expandedId === entry.participant_id ? null : entry.participant_id
                )
              }
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <span
                className={`text-base font-black w-7 text-center flex-shrink-0 ${
                  RANK_COLORS[entry.rank] ?? "text-gray-300"
                }`}
              >
                {entry.rank}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{entry.participant_name}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {entry.has_paid ? (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    ✓ betaald
                  </span>
                ) : (
                  <span className="text-xs text-red-400 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                    ✗
                  </span>
                )}
                <span className="text-lg font-black text-[#1b5e20] min-w-[3rem] text-right">
                  {entry.total_points}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                </span>
                <span className="text-gray-300 text-xs">
                  {expandedId === entry.participant_id ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {expandedId === entry.participant_id && (
              <div className="bg-gray-50 border-t border-gray-100">
                <ParticipantDetail matchPoints={entry.match_points} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
