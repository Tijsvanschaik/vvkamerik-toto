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

  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#e65100] px-5 py-4 flex items-center gap-2">
        <span className="text-xl">⚽</span>
        <h2 className="text-white font-bold text-lg tracking-wide">Doelpuntenmakers</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Naam</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stemmen</th>
              {stats.some((s) => s.actual_goals > 0) && (
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Goals</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.map((player, i) => (
              <tr key={player.player_id} className="hover:bg-orange-50/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center text-xs font-bold ${
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{player.player_name}</p>
                      {player.team_name && (
                        <p className="text-xs text-gray-400">{player.team_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e65100] rounded-full"
                        style={{ width: `${(player.vote_count / maxVotes) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 min-w-[2rem] text-right">
                      {player.vote_count}
                    </span>
                  </div>
                </td>
                {stats.some((s) => s.actual_goals > 0) && (
                  <td className="px-5 py-3 text-right">
                    {player.actual_goals > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        ⚽ {player.actual_goals}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">–</span>
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
          className="w-full py-3 text-sm text-gray-500 hover:text-[#e65100] hover:bg-orange-50/30 transition-colors border-t border-gray-100 font-medium"
        >
          {showAll ? "▲ Minder tonen" : `▼ Meer doelpuntenmakers (${stats.length - 6} meer)`}
        </button>
      )}
    </div>
  );
}
