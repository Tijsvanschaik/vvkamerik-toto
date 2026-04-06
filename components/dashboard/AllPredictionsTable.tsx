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
  home_team_name: string;
  away_team_name: string;
  kamerik_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface AllPredictionsTableProps {
  rows: ParticipantRow[];
  matches: MatchColumn[];
}

const PAGE_SIZE = 10;

export default function AllPredictionsTable({ rows, matches }: AllPredictionsTableProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = search.trim()
    ? rows.filter((r) =>
        r.participant_name.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  const displayed = search.trim() || showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
              Inzendingen
            </p>
            <h2 className="text-xl font-bold text-gray-900">Alle voorspellingen</h2>
          </div>
          <span className="text-sm text-gray-400 mt-1.5 flex-shrink-0">{rows.length} deelnemers</span>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowAll(false);
            }}
            placeholder="Zoek op naam..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]/30 placeholder-gray-300 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[150px]">
                Naam
              </th>
              {matches.map((match) => (
                <th
                  key={match.id}
                  className="text-center px-3 py-3 min-w-[88px]"
                >
                  <div className="text-xs font-semibold text-gray-700 leading-tight">
                    {match.kamerik_team_name}
                  </div>
                  {match.is_finished && match.actual_home_goals != null && (
                    <div className="text-[11px] font-bold text-[#1e3a8a] mt-0.5">
                      {match.home_team_name === match.kamerik_team_name
                        ? `${match.actual_home_goals}–${match.actual_away_goals}`
                        : `${match.actual_away_goals}–${match.actual_home_goals}`}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={matches.length + 1}
                  className="text-center py-8 text-sm text-gray-400"
                >
                  Geen deelnemers gevonden voor &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              displayed.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-white min-w-[150px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-900 truncate max-w-[120px] text-base">
                        {row.participant_name}
                      </span>
                      {row.has_paid ? (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          ✗
                        </span>
                      )}
                    </div>
                  </td>
                  {row.predictions.map((pred) => (
                    <td key={pred.match_id} className="px-3 py-4 text-center">
                      {pred.predicted_home_goals != null ? (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg tabular-nums">
                          {pred.predicted_home_goals}–{pred.predicted_away_goals}
                        </span>
                      ) : (
                        <span className="text-gray-200">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show more (only when not searching) */}
      {!search && filtered.length > PAGE_SIZE && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100 font-medium"
        >
          {showAll
            ? "Minder tonen"
            : `Toon alle ${filtered.length} deelnemers`}
        </button>
      )}
    </div>
  );
}
