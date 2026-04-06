"use client";

import { useState } from "react";

interface MatchPrediction {
  match_id: string;
  match_order: number;
  predicted_home_goals: number | null;
  predicted_away_goals: number | null;
  chosen_player_name: string | null;
}

interface ParticipantRow {
  participant_name: string;
  has_paid: boolean;
  predictions: MatchPrediction[];
}

interface MatchColumn {
  id: string;
  match_order: number;
  kamerik_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface AllPredictionsTableProps {
  rows: ParticipantRow[];
  matches: MatchColumn[];
}

export default function AllPredictionsTable({ rows, matches }: AllPredictionsTableProps) {
  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE = 10;
  const displayed = showAll ? rows : rows.slice(0, PAGE_SIZE);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#0d47a1] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h2 className="text-white font-bold text-lg tracking-wide">Alle voorspellingen</h2>
        </div>
        <span className="text-blue-200 text-sm">{rows.length} deelnemers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[130px]">
                Naam
              </th>
              {matches.map((match) => (
                <th
                  key={match.id}
                  className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[90px]"
                >
                  <div>{match.kamerik_team_name}</div>
                  {match.is_finished && match.actual_home_goals != null && (
                    <div className="text-[10px] font-normal text-green-600 mt-0.5">
                      {match.actual_home_goals}–{match.actual_away_goals}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-4 py-3 sticky left-0 bg-white font-medium text-gray-900 min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[100px]">{row.participant_name}</span>
                    {row.has_paid ? (
                      <span className="text-green-500 text-xs flex-shrink-0">✓</span>
                    ) : (
                      <span className="text-red-400 text-xs flex-shrink-0">✗</span>
                    )}
                  </div>
                </td>
                {row.predictions.map((pred) => (
                  <td key={pred.match_id} className="px-3 py-3 text-center">
                    {pred.predicted_home_goals != null ? (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        {pred.predicted_home_goals}–{pred.predicted_away_goals}
                      </span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE_SIZE && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-sm text-gray-500 hover:text-[#0d47a1] hover:bg-blue-50/30 transition-colors border-t border-gray-100 font-medium"
        >
          {showAll
            ? "▲ Minder tonen"
            : `▼ Meer voorspellingen (${rows.length - PAGE_SIZE} meer)`}
        </button>
      )}
    </div>
  );
}
