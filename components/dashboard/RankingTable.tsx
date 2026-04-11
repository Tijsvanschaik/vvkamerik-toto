"use client";

import { useState } from "react";
import type { LeaderboardEntry, MatchPointBreakdown } from "@/lib/types";

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

const PAGE_SIZE = 10;

const rankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-700";
  return "text-gray-400";
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-yellow-50 border-yellow-200";
  if (rank === 2) return "bg-gray-50 border-gray-200";
  if (rank === 3) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-100";
};

// Colour-codes a match pill by points earned
function pillStyle(mp: MatchPointBreakdown): string {
  if (mp.is_cancelled) return "bg-orange-100 text-orange-400";
  if (mp.actual_home_goals == null) return "bg-gray-100 text-gray-400";
  if (mp.total >= 8) return "bg-[#1e3a8a] text-white";
  if (mp.total >= 4) return "bg-blue-100 text-[#1e3a8a]";
  if (mp.total > 0)  return "bg-blue-50 text-blue-400";
  return "bg-gray-100 text-gray-400";
}

// Tooltip text on hover
function pillTitle(mp: MatchPointBreakdown): string {
  if (mp.is_cancelled) return `${mp.home_team_name} vs ${mp.away_team_name} — Afgelast`;
  if (mp.actual_home_goals == null) return `${mp.home_team_name} vs ${mp.away_team_name} — Nog niet gespeeld`;
  const breakdown = [
    mp.points_winner   > 0 ? `winnaar +${mp.points_winner}`       : "",
    mp.points_home_goals > 0 ? `thuis +${mp.points_home_goals}`   : "",
    mp.points_away_goals > 0 ? `uit +${mp.points_away_goals}`     : "",
    mp.points_exact_bonus > 0 ? `exact +${mp.points_exact_bonus}` : "",
    mp.points_topscorer  > 0 ? `⚽ +${mp.points_topscorer}`       : "",
  ].filter(Boolean).join("  ·  ") || "geen punten";
  return `${mp.home_team_name} vs ${mp.away_team_name}\nJij: ${mp.predicted_home_goals}–${mp.predicted_away_goals}  Uitslag: ${mp.actual_home_goals}–${mp.actual_away_goals}\n${breakdown}`;
}

function ExpandedBreakdown({ matchPoints }: { matchPoints: MatchPointBreakdown[] }) {
  const sorted = [...matchPoints].sort((a, b) => a.match_order - b.match_order);
  return (
    <div className="px-5 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {sorted.map((mp) => {
        const isPlayed = mp.actual_home_goals != null;
        return (
          <div
            key={mp.match_id}
            className={`rounded-xl border px-3 py-2 text-center ${
              mp.is_cancelled
                ? "bg-orange-50 border-orange-100"
                : isPlayed
                ? "bg-white border-gray-100"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <p className="text-[10px] text-gray-400 truncate mb-1">
              {mp.home_team_name} vs {mp.away_team_name}
            </p>
            {mp.is_cancelled ? (
              <p className="text-[11px] text-orange-500 font-semibold">🚫 Afgelast</p>
            ) : isPlayed ? (
              <>
                <p className="text-[11px] text-gray-400 tabular-nums">
                  <span className="text-gray-500 font-semibold">{mp.predicted_home_goals}–{mp.predicted_away_goals}</span>
                  <span className="mx-1 text-gray-300">→</span>
                  <span className="font-semibold">{mp.actual_home_goals}–{mp.actual_away_goals}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                  {mp.points_winner > 0 && <span className="text-[9px] bg-[#1e3a8a] text-white rounded px-1">W+{mp.points_winner}</span>}
                  {mp.points_home_goals > 0 && <span className="text-[9px] bg-sky-100 text-sky-700 rounded px-1">T+{mp.points_home_goals}</span>}
                  {mp.points_away_goals > 0 && <span className="text-[9px] bg-sky-100 text-sky-700 rounded px-1">U+{mp.points_away_goals}</span>}
                  {mp.points_exact_bonus > 0 && <span className="text-[9px] bg-purple-100 text-purple-700 rounded px-1">X+{mp.points_exact_bonus}</span>}
                  {mp.points_topscorer > 0 && <span className="text-[9px] bg-green-100 text-green-700 rounded px-1">⚽+{mp.points_topscorer}</span>}
                  {mp.total === 0 && <span className="text-[9px] text-gray-300">–</span>}
                </div>
                <p className={`text-sm font-black mt-1 tabular-nums ${mp.total > 0 ? "text-[#1e3a8a]" : "text-gray-300"}`}>
                  {mp.total} pt
                </p>
              </>
            ) : (
              <p className="text-[11px] text-gray-300 italic">Nog niet gespeeld</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RankingTable({ entries }: RankingTableProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayed = showAll ? entries : entries.slice(0, PAGE_SIZE);
  const hasMore = entries.length > PAGE_SIZE;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">Standen</p>
          <h2 className="text-xl font-bold text-gray-900">Ranglijst</h2>
        </div>
        <span className="text-sm text-gray-400">{entries.length} deelnemers</span>
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-base text-gray-400">
            De ranglijst is zichtbaar zodra de eerste wedstrijd is gespeeld.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {displayed.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const isExpanded = expandedId === entry.participant_id;
            const sorted = [...entry.match_points].sort((a, b) => a.match_order - b.match_order);

            return (
              <div key={entry.participant_id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.participant_id)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
                >
                  {/* Rank badge */}
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${isTop3 ? rankBg(entry.rank) : "bg-gray-50 border-gray-100"}`}>
                    <span className={`text-xs font-black ${rankColor(entry.rank)}`}>
                      {entry.rank}
                    </span>
                  </div>

                  {/* Name + pills stacked */}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 text-sm truncate block">
                      {entry.participant_name}
                    </span>
                    {!isExpanded && sorted.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {sorted.map((mp) => (
                          <span
                            key={mp.match_id}
                            title={pillTitle(mp)}
                            className={`inline-flex items-center justify-center rounded-md text-[11px] font-bold px-2 py-0.5 tabular-nums cursor-default ${pillStyle(mp)}`}
                          >
                            {mp.is_cancelled ? "🚫" : mp.actual_home_goals == null ? "–" : `${mp.total}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total points */}
                  <span className="font-black text-[#1e3a8a] tabular-nums text-sm sm:text-base flex-shrink-0">
                    {entry.total_points}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                  </span>

                  <span className="text-gray-300 text-xs flex-shrink-0">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-50 bg-gray-50/30">
                    <ExpandedBreakdown matchPoints={entry.match_points} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100 font-medium"
        >
          {showAll ? "Minder tonen ▲" : `Toon alle ${entries.length} deelnemers ▼`}
        </button>
      )}
    </div>
  );
}
