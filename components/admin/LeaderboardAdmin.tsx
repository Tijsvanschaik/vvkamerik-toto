"use client";

import { useState, useEffect } from "react";

interface MatchPoints {
  match_id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  predicted_home_goals: number;
  predicted_away_goals: number;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  points_winner: number;
  points_home_goals: number;
  points_away_goals: number;
  points_exact_bonus: number;
  points_topscorer: number;
  chosen_player_name: string | null;
  chosen_player_scored: boolean;
  chosen_player_goals: number;
  total: number;
  is_cancelled?: boolean;
}

interface Entry {
  participant_id: string;
  participant_name: string;
  has_paid: boolean;
  total_points: number;
  rank: number;
  match_points: MatchPoints[];
}

const rankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-600";
  return "text-gray-400";
};

const pillStyle = (mp: MatchPoints) => {
  if (mp.is_cancelled) return "bg-orange-100 text-orange-500";
  if (mp.actual_home_goals == null) return "bg-gray-100 text-gray-400";
  if (mp.total >= 8) return "bg-[#1e3a8a] text-white";
  if (mp.total >= 4) return "bg-blue-100 text-[#1e3a8a]";
  if (mp.total > 0) return "bg-blue-50 text-blue-400";
  return "bg-gray-100 text-gray-400";
};

function PointRow({ label, pts, color }: { label: string; pts: number; color: string }) {
  if (pts <= 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-gray-500 truncate">{label}</span>
      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ml-1 flex-shrink-0 ${color}`}>
        +{pts}
      </span>
    </div>
  );
}

export default function LeaderboardAdmin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard ?? []);
        setLastUpdated(new Date());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Tussenstand</p>
          <h2 className="text-xl font-bold text-gray-900">Ranglijst</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={fetchData}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↻ Verversen
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Nog geen resultaten — voer eerst uitslagen in.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {entries.map((entry) => {
              const sorted = [...entry.match_points].sort((a, b) => a.match_order - b.match_order);
              const isTop3 = entry.rank <= 3;
              const isExpanded = expandedId === entry.participant_id;

              return (
                <div key={entry.participant_id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.participant_id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
                  >
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                      isTop3
                        ? entry.rank === 1 ? "bg-yellow-50 border-yellow-200"
                          : entry.rank === 2 ? "bg-gray-50 border-gray-200"
                          : "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-100"
                    }`}>
                      <span className={`text-xs font-black ${rankColor(entry.rank)}`}>
                        {entry.rank}
                      </span>
                    </div>

                    {/* Name + pills (hidden when expanded) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {entry.participant_name}
                        </span>
                        {!entry.has_paid && (
                          <span className="text-[10px] font-bold bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            niet betaald
                          </span>
                        )}
                      </div>
                      {!isExpanded && sorted.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {sorted.map((mp) => (
                            <span
                              key={mp.match_id}
                              title={`${mp.home_team_name} vs ${mp.away_team_name}`}
                              className={`inline-flex items-center justify-center rounded-md text-[11px] font-bold px-2 py-0.5 tabular-nums ${pillStyle(mp)}`}
                            >
                              {mp.is_cancelled ? "🚫" : mp.actual_home_goals == null ? "–" : `${mp.total}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <span className="font-black text-[#1e3a8a] tabular-nums text-base flex-shrink-0">
                      {entry.total_points}
                      <span className="text-xs font-normal text-gray-400 ml-0.5">pt</span>
                    </span>
                    <span className="text-gray-300 text-xs flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t border-gray-50 bg-gray-50/30">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {sorted.map((mp) => {
                          const isPlayed = mp.actual_home_goals != null;
                          return (
                            <div
                              key={mp.match_id}
                              className={`rounded-xl border px-3 py-2 ${
                                mp.is_cancelled ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100"
                              }`}
                            >
                              <p className="text-[10px] text-gray-400 truncate mb-1 text-center font-semibold">
                                {mp.home_team_name} vs {mp.away_team_name}
                              </p>
                              {mp.is_cancelled ? (
                                <p className="text-[11px] text-orange-500 font-semibold">🚫 Afgelast</p>
                              ) : isPlayed ? (
                                <>
                                  {/* Scores */}
                                  <div className="flex items-center justify-center gap-1.5 text-xs mt-0.5">
                                    <span className="font-black text-gray-800 tabular-nums">{mp.predicted_home_goals}–{mp.predicted_away_goals}</span>
                                    <span className="text-gray-300 text-[10px]">→</span>
                                    <span className="font-black text-gray-500 tabular-nums">{mp.actual_home_goals}–{mp.actual_away_goals}</span>
                                  </div>

                                  {/* Point rows */}
                                  <div className="mt-2 space-y-1 text-left">
                                    <PointRow
                                      label="Juiste winnaar"
                                      pts={mp.points_winner}
                                      color="bg-[#1e3a8a] text-white"
                                    />
                                    <PointRow
                                      label="Thuisgoals"
                                      pts={mp.points_home_goals}
                                      color="bg-sky-100 text-sky-700"
                                    />
                                    <PointRow
                                      label="Uitgoals"
                                      pts={mp.points_away_goals}
                                      color="bg-sky-100 text-sky-700"
                                    />
                                    <PointRow
                                      label="Exacte uitslag"
                                      pts={mp.points_exact_bonus}
                                      color="bg-purple-100 text-purple-700"
                                    />
                                    {mp.chosen_player_name && (
                                      <div className={`flex items-center justify-between rounded px-1.5 py-0.5 ${
                                        mp.chosen_player_scored ? "bg-green-50" : "bg-gray-50"
                                      }`}>
                                        <span className={`text-[10px] truncate max-w-[80px] ${mp.chosen_player_scored ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                                          ⚽ {mp.chosen_player_name}
                                          {mp.chosen_player_scored && ` (${mp.chosen_player_goals}×)`}
                                        </span>
                                        <span className={`text-[10px] font-black ml-1 flex-shrink-0 ${mp.points_topscorer > 0 ? "text-green-700" : "text-gray-300"}`}>
                                          +{mp.points_topscorer}
                                        </span>
                                      </div>
                                    )}
                                    {mp.total === 0 && (
                                      <p className="text-[10px] text-gray-300 text-center italic">geen punten</p>
                                    )}
                                  </div>

                                  {/* Total */}
                                  <p className={`text-sm font-black mt-2 tabular-nums border-t border-gray-100 pt-1.5 ${mp.total > 0 ? "text-[#1e3a8a]" : "text-gray-300"}`}>
                                    Totaal: {mp.total} pt
                                  </p>
                                </>
                              ) : (
                                <p className="text-[11px] text-gray-300 italic mt-1">Niet gespeeld</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
