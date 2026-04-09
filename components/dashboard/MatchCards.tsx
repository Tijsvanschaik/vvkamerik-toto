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
  is_cancelled: boolean;
  cancelled_reason: string | null;
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
  kamerikIsHome,
}: {
  homePct: number;
  drawPct: number;
  awayPct: number;
  total: number;
  kamerikIsHome: boolean;
}) {
  // Always show Kamerik on the left
  const kamerikPct = kamerikIsHome ? homePct : awayPct;
  const opponentPct = kamerikIsHome ? awayPct : homePct;

  if (total === 0) {
    return (
      <div className="h-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-[10px] text-gray-400">Nog geen voorspellingen</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Bar: Kamerik | Gelijk | Tegenstander */}
      <div className="flex h-4 rounded-full overflow-hidden text-[10px] font-bold text-white">
        {kamerikPct > 0 && (
          <div
            className="bg-[#1e3a8a] flex items-center justify-center transition-all duration-500"
            style={{ width: `${kamerikPct}%` }}
          >
            {kamerikPct >= 14 && `${kamerikPct}%`}
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
        {opponentPct > 0 && (
          <div
            className="bg-slate-400 flex items-center justify-center transition-all duration-500"
            style={{ width: `${opponentPct}%` }}
          >
            {opponentPct >= 14 && `${opponentPct}%`}
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="grid grid-cols-3 text-center text-[10px]">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-gray-400">Kamerik</span>
          <span className="font-bold text-[#1e3a8a]">{kamerikPct}%</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-400">Gelijk</span>
          <span className="font-bold text-gray-500">{drawPct}%</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-gray-400">Tegenstander</span>
          <span className="font-bold text-slate-500">{opponentPct}%</span>
        </div>
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
  const kamerikIsHome = match.home_team_name === match.kamerik_team_name;

  if (match.is_cancelled) {
    return (
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 flex flex-col gap-3 opacity-80">
        <div className="text-center">
          <p className="text-lg font-black text-[#1e3a8a] leading-tight">
            {match.kamerik_team_name}
          </p>
          <p className="text-base text-gray-400 mt-0.5">vs {opponent}</p>
        </div>
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            🚫 Afgelast
          </span>
        </div>
        {match.cancelled_reason && (
          <p className="text-xs text-orange-500 text-center leading-relaxed">
            {match.cancelled_reason}
          </p>
        )}
        <p className="text-[10px] text-gray-400 text-center">
          Iedereen krijgt 0 punten voor dit duel
        </p>
      </div>
    );
  }

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
        kamerikIsHome={kamerikIsHome}
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
