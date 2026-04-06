"use client";

interface MatchStat {
  match_id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  total: number;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface MatchPredictionBarsProps {
  stats: MatchStat[];
}

export default function MatchPredictionBars({ stats }: MatchPredictionBarsProps) {
  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#4a148c] px-5 py-4 flex items-center gap-2">
        <span className="text-xl">📊</span>
        <h2 className="text-white font-bold text-lg tracking-wide">Wedstrijd Voorspellingen</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {stats.map((match) => (
          <div key={match.match_id} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">
                {match.home_team_name} – {match.away_team_name}
              </span>
              {match.is_finished && match.actual_home_goals != null && (
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {match.actual_home_goals} – {match.actual_away_goals}
                </span>
              )}
            </div>

            <div className="flex items-center text-[11px] font-medium text-white mb-1">
              <span className="truncate max-w-[120px]">{match.home_team_name}</span>
              <span className="ml-auto truncate max-w-[120px] text-right">{match.away_team_name}</span>
            </div>

            {match.total > 0 ? (
              <div className="flex h-6 rounded-lg overflow-hidden text-xs font-bold text-white">
                {match.home_win_pct > 0 && (
                  <div
                    className="bg-[#2e7d32] flex items-center justify-center transition-all"
                    style={{ width: `${match.home_win_pct}%` }}
                  >
                    {match.home_win_pct >= 10 && `${match.home_win_pct}%`}
                  </div>
                )}
                {match.draw_pct > 0 && (
                  <div
                    className="bg-[#f57c00] flex items-center justify-center transition-all"
                    style={{ width: `${match.draw_pct}%` }}
                  >
                    {match.draw_pct >= 10 && `${match.draw_pct}%`}
                  </div>
                )}
                {match.away_win_pct > 0 && (
                  <div
                    className="bg-[#c62828] flex items-center justify-center transition-all"
                    style={{ width: `${match.away_win_pct}%` }}
                  >
                    {match.away_win_pct >= 10 && `${match.away_win_pct}%`}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                Nog geen voorspellingen
              </div>
            )}

            <div className="flex gap-4 mt-1 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2e7d32] inline-block" />
                Thuis wint
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f57c00] inline-block" />
                Gelijk
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#c62828] inline-block" />
                Uit wint
              </span>
              <span className="ml-auto text-gray-400">{match.total} voorsp.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
