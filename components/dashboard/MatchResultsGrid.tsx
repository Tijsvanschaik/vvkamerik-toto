"use client";

interface MatchInfo {
  id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface MatchResultsGridProps {
  matches: MatchInfo[];
}

export default function MatchResultsGrid({ matches }: MatchResultsGridProps) {
  if (matches.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#1b5e20] px-5 py-4 flex items-center gap-2">
        <span className="text-xl">🏟️</span>
        <h2 className="text-white font-bold text-lg tracking-wide">Wedstrijden</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-px bg-gray-100">
        {matches.map((match) => (
          <div key={match.id} className="bg-white px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-medium">
                Wedstrijd {match.match_order}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                match.is_finished
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-50 text-yellow-600"
              }`}>
                {match.is_finished ? "Afgelopen" : "Gepland"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                  {match.home_team_name}
                </span>
                <span className={`text-xl font-black tabular-nums ${
                  match.is_finished ? "text-gray-900" : "text-gray-200"
                }`}>
                  {match.is_finished ? match.actual_home_goals : "–"}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                  {match.away_team_name}
                </span>
                <span className={`text-xl font-black tabular-nums ${
                  match.is_finished ? "text-gray-900" : "text-gray-200"
                }`}>
                  {match.is_finished ? match.actual_away_goals : "–"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
