"use client";

export interface MatchCardData {
  match_id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  kamerik_team_name: string;
  home_win_pct: number;
  draw_pct: number;
  away_win_pct: number;
  total: number;
  avg_home_goals: number | null;
  avg_away_goals: number | null;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface MatchCardsProps {
  matches: MatchCardData[];
}

function StatusBadge({ isFinished }: { isFinished: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isFinished
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isFinished ? "bg-green-500" : "bg-gray-400"}`} />
      {isFinished ? "Gespeeld" : "Gepland"}
    </span>
  );
}

function CrowdBar({
  homePct,
  drawPct,
  awayPct,
  total,
}: {
  homePct: number;
  drawPct: number;
  awayPct: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="h-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-[10px] text-gray-400">Nog geen voorspellingen</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex h-4 rounded-full overflow-hidden text-[10px] font-bold text-white">
        {homePct > 0 && (
          <div
            className="bg-[#1e3a8a] flex items-center justify-center transition-all duration-500"
            style={{ width: `${homePct}%` }}
          >
            {homePct >= 14 && `${homePct}%`}
          </div>
        )}
        {drawPct > 0 && (
          <div
            className="bg-gray-300 flex items-center justify-center transition-all duration-500"
            style={{ width: `${drawPct}%` }}
          >
            {drawPct >= 14 && `${drawPct}%`}
          </div>
        )}
        {awayPct > 0 && (
          <div
            className="bg-blue-300 flex items-center justify-center transition-all duration-500"
            style={{ width: `${awayPct}%` }}
          >
            {awayPct >= 14 && `${awayPct}%`}
          </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a] inline-block" />
          {homePct}%
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
          {drawPct}%
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block" />
          {awayPct}%
        </span>
      </div>
    </div>
  );
}

function getOpponent(match: MatchCardData): string {
  if (match.home_team_name === match.kamerik_team_name) {
    return match.away_team_name;
  }
  return match.home_team_name;
}

function getKamerikScore(match: MatchCardData): { kamerik: number; opponent: number } | null {
  if (match.actual_home_goals == null || match.actual_away_goals == null) return null;
  if (match.home_team_name === match.kamerik_team_name) {
    return { kamerik: match.actual_home_goals, opponent: match.actual_away_goals };
  }
  return { kamerik: match.actual_away_goals, opponent: match.actual_home_goals };
}

function getAvgKamerikScore(match: MatchCardData): { kamerik: number; opponent: number } | null {
  if (match.avg_home_goals == null) return null;
  if (match.home_team_name === match.kamerik_team_name) {
    return { kamerik: match.avg_home_goals, opponent: match.avg_away_goals! };
  }
  return { kamerik: match.avg_away_goals!, opponent: match.avg_home_goals };
}

function MatchCard({ match }: { match: MatchCardData }) {
  const opponent = getOpponent(match);
  const score = getKamerikScore(match);
  const avgScore = getAvgKamerikScore(match);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* VVKamerik team prominent, opponent below */}
      <div className="text-center">
        <p className="text-lg font-black text-[#1e3a8a] leading-tight">
          {match.kamerik_team_name}
        </p>
        <p className="text-base text-gray-400 mt-0.5">vs {opponent}</p>
      </div>

      {/* Score */}
      {score ? (
        <div className="text-center">
          <span className="text-4xl font-black text-gray-900 tabular-nums tracking-tight">
            {score.kamerik}–{score.opponent}
          </span>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-xl font-semibold text-gray-200">–</span>
        </div>
      )}

      {/* Crowd bar */}
      <CrowdBar
        homePct={match.home_win_pct}
        drawPct={match.draw_pct}
        awayPct={match.away_win_pct}
        total={match.total}
      />

      {/* Avg prediction */}
      {avgScore != null && (
        <p className="text-sm text-gray-400 text-center">
          Gem.{" "}
          <span className="font-semibold text-gray-600 tabular-nums">
            {avgScore.kamerik}–{avgScore.opponent}
          </span>
        </p>
      )}
    </div>
  );
}

export default function MatchCards({ matches }: MatchCardsProps) {
  if (matches.length === 0) return null;

  return (
    <section>
      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-4">
        Wedstrijden
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.match_id} match={match} />
        ))}
      </div>
    </section>
  );
}
