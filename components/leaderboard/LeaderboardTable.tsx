"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import ParticipantDetail from "./ParticipantDetail";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  tvMode: boolean;
}

export default function LeaderboardTable({ entries, tvMode }: LeaderboardTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nog geen deelnemers
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500 ${tvMode ? "text-base px-6 py-4" : ""}`}>
        <span>#</span>
        <span>Naam</span>
        <span>Betaald</span>
        <span className="text-right">Punten</span>
      </div>

      {entries.map((entry) => (
        <div key={entry.participant_id} className="border-b last:border-b-0">
          <button
            onClick={() =>
              !tvMode &&
              setExpandedId(
                expandedId === entry.participant_id ? null : entry.participant_id
              )
            }
            className={`w-full grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 items-center text-left transition-colors ${
              !tvMode ? "hover:bg-gray-50 cursor-pointer" : ""
            } ${tvMode ? "px-6 py-4" : ""}`}
          >
            <span
              className={`font-bold ${tvMode ? "text-2xl w-12" : "text-lg w-8"} ${
                entry.rank === 1
                  ? "text-yellow-500"
                  : entry.rank === 2
                  ? "text-gray-400"
                  : entry.rank === 3
                  ? "text-amber-700"
                  : "text-gray-300"
              }`}
            >
              {entry.rank}
            </span>
            <span className={`font-medium truncate ${tvMode ? "text-xl" : ""}`}>
              {entry.participant_name}
            </span>
            <span className={tvMode ? "text-lg" : ""}>
              {entry.has_paid ? (
                <span className="text-green-600">&#10003;</span>
              ) : (
                <span className="text-red-400">&#10007;</span>
              )}
            </span>
            <span className={`text-right font-bold ${tvMode ? "text-2xl" : "text-lg"} text-primary`}>
              {entry.total_points}
            </span>
          </button>

          {!tvMode && expandedId === entry.participant_id && (
            <ParticipantDetail matchPoints={entry.match_points} />
          )}
        </div>
      ))}
    </div>
  );
}
