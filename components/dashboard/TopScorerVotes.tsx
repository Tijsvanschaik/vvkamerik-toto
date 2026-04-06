"use client";

import { useState } from "react";

interface PlayerVoteStat {
  player_id: string;
  player_name: string;
  team_name: string;
  vote_count: number;
  actual_goals: number;
}

interface TopScorerVotesProps {
  stats: PlayerVoteStat[];
}

export default function TopScorerVotes({ stats }: TopScorerVotesProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? stats : stats.slice(0, 6);
  const maxVotes = stats[0]?.vote_count ?? 1;
  const hasActualGoals = stats.some((s) => s.actual_goals > 0);

  if (stats.length === 0) return null;

  const rankColor = (i: number) => {
    if (i === 0) return "text-yellow-500";
    if (i === 1) return "text-gray-400";
    if (i === 2) return "text-amber-700";
    return "text-gray-300";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">
          Crowd keuze
        </p>
        <h2 className="text-xl font-bold text-gray-900">Topscoorders</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Speler
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Stemmen
              </th>
              {hasActualGoals && (
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Goals
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.map((player, i) => (
              <tr key={player.player_id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-base font-black w-5 text-center flex-shrink-0 ${rankColor(i)}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-base">{player.player_name}</p>
                      {player.team_name && (
                        <p className="text-sm text-gray-400 truncate">{player.team_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:flex w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1e3a8a] rounded-full"
                        style={{ width: `${(player.vote_count / maxVotes) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 tabular-nums min-w-[1.5rem] text-right text-base">
                      {player.vote_count}
                    </span>
                  </div>
                </td>
                {hasActualGoals && (
                  <td className="px-6 py-4 text-right">
                    {player.actual_goals > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        ⚽ {player.actual_goals}
                      </span>
                    ) : (
                      <span className="text-gray-200 text-xs">–</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100 font-medium"
        >
          {showAll ? "Minder tonen" : `Toon alle ${stats.length} spelers`}
        </button>
      )}
    </div>
  );
}
