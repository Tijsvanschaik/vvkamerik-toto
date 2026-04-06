"use client";

import type { MatchPointBreakdown } from "@/lib/types";

interface ParticipantDetailProps {
  matchPoints: MatchPointBreakdown[];
}

export default function ParticipantDetail({ matchPoints }: ParticipantDetailProps) {
  return (
    <div className="px-4 pb-4 space-y-2">
      {matchPoints
        .sort((a, b) => a.match_order - b.match_order)
        .map((mp) => (
          <div
            key={mp.match_id}
            className="bg-gray-50 rounded-lg p-3 text-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-600">
                {mp.home_team_name} vs {mp.away_team_name}
              </span>
              <span className="font-bold text-primary">
                {mp.total} pt
              </span>
            </div>

            <div className="flex gap-4 text-xs text-gray-500 mb-1">
              <span>
                Voorspeld: {mp.predicted_home_goals} - {mp.predicted_away_goals}
              </span>
              {mp.actual_home_goals != null && (
                <span>
                  Uitslag: {mp.actual_home_goals} - {mp.actual_away_goals}
                </span>
              )}
            </div>

            {mp.chosen_player_name && (
              <div className="text-xs text-gray-500">
                Topscoorder: {mp.chosen_player_name}
                {mp.chosen_player_scored && (
                  <span className="text-green-600 ml-1">
                    ({mp.chosen_player_goals} goal{mp.chosen_player_goals !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            )}

            {mp.actual_home_goals != null && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mp.points_winner > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                    Winnaar +{mp.points_winner}
                  </span>
                )}
                {mp.points_home_goals > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    Thuis +{mp.points_home_goals}
                  </span>
                )}
                {mp.points_away_goals > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    Uit +{mp.points_away_goals}
                  </span>
                )}
                {mp.points_exact_bonus > 0 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                    Exact +{mp.points_exact_bonus}
                  </span>
                )}
                {mp.points_topscorer > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                    Topscoorder +{mp.points_topscorer}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
