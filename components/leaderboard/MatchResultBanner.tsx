"use client";

interface MatchResult {
  id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface MatchResultBannerProps {
  matches: MatchResult[];
  tvMode: boolean;
}

export default function MatchResultBanner({ matches, tvMode }: MatchResultBannerProps) {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-2 ${tvMode ? "justify-center" : ""}`}>
      {matches.map((match) => (
        <div
          key={match.id}
          className={`flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
            tvMode ? "w-48 p-4" : "w-40 p-3"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs text-gray-400 ${tvMode ? "text-sm" : ""}`}>
              Wedstrijd {match.match_order}
            </span>
            {match.is_finished ? (
              <span className="text-xs text-green-600">&#10003;</span>
            ) : (
              <span className="text-xs text-yellow-600">&#9203;</span>
            )}
          </div>
          <div className={`text-center ${tvMode ? "space-y-1" : "space-y-0.5"}`}>
            <p className={`font-medium truncate ${tvMode ? "text-base" : "text-sm"}`}>
              {match.home_team_name}
            </p>
            <p className={`font-bold ${tvMode ? "text-2xl" : "text-lg"} ${
              match.is_finished ? "text-gray-900" : "text-gray-300"
            }`}>
              {match.is_finished
                ? `${match.actual_home_goals} - ${match.actual_away_goals}`
                : "– – –"}
            </p>
            <p className={`font-medium truncate ${tvMode ? "text-base" : "text-sm"}`}>
              {match.away_team_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
