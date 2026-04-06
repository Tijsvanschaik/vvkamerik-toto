"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { LeaderboardEntry } from "@/lib/types";
import MatchResultsGrid from "@/components/dashboard/MatchResultsGrid";
import PodiumSection from "@/components/dashboard/PodiumSection";
import RankingTable from "@/components/dashboard/RankingTable";
import PrizePotCard from "@/components/dashboard/PrizePotCard";
import MatchPredictionBars from "@/components/dashboard/MatchPredictionBars";
import TopScorerVotes from "@/components/dashboard/TopScorerVotes";
import AllPredictionsTable from "@/components/dashboard/AllPredictionsTable";

interface MatchInfo {
  id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  kamerik_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface DashboardData {
  leaderboard: LeaderboardEntry[];
  matches: MatchInfo[];
  settings: {
    entry_fee: number;
    prize_1st: number;
    prize_2nd: number;
    prize_3rd: number;
    prize_pct_club: number;
  };
  participant_count: number;
  total_pot: number;
  club_share: number;
  all_finished: boolean;
  has_finished: boolean;
  match_prediction_stats: {
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
  }[];
  player_vote_stats: {
    player_id: string;
    player_name: string;
    team_name: string;
    vote_count: number;
    actual_goals: number;
  }[];
  all_predictions: {
    participant_name: string;
    has_paid: boolean;
    predictions: {
      match_id: string;
      match_order: number;
      predicted_home_goals: number | null;
      predicted_away_goals: number | null;
      chosen_player_name: string | null;
    }[];
  }[];
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const tvMode = searchParams.get("tv") === "true";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confettiShown, setConfettiShown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, tvMode ? 30000 : 60000);
    return () => clearInterval(interval);
  }, [fetchData, tvMode]);

  useEffect(() => {
    if (data?.all_finished && !confettiShown && data.leaderboard.length > 0) {
      setConfettiShown(true);
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.3 },
          colors: ["#1b5e20", "#ffd600", "#ffffff", "#e65100"],
        });
      });
    }
  }, [data?.all_finished, confettiShown, data?.leaderboard.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-10 h-10 border-4 border-[#1b5e20] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400">
        Kon het dashboard niet laden.
      </div>
    );
  }

  const top3 = data.leaderboard.slice(0, 3);

  return (
    <div className={tvMode ? "bg-[#0a1a0a] min-h-screen" : ""}>
      <div className={`space-y-5 ${tvMode ? "px-6 py-6 max-w-7xl mx-auto" : ""}`}>
        {/* Match results */}
        {data.matches.length > 0 && <MatchResultsGrid matches={data.matches} />}

        {/* Podium — only when there are results */}
        {data.has_finished && top3.length > 0 && (
          <PodiumSection
            top3={top3}
            prizes={{
              prize_1st: data.settings.prize_1st,
              prize_2nd: data.settings.prize_2nd,
              prize_3rd: data.settings.prize_3rd,
            }}
            allFinished={data.all_finished}
          />
        )}

        {/* Leaderboard */}
        <RankingTable entries={data.leaderboard} />

        {/* Two-column grid for prize pot + prediction bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PrizePotCard
            participantCount={data.participant_count}
            totalPot={data.total_pot}
            clubShare={data.club_share}
            prize1st={data.settings.prize_1st}
            prize2nd={data.settings.prize_2nd}
            prize3rd={data.settings.prize_3rd}
          />
          {data.match_prediction_stats.length > 0 && (
            <MatchPredictionBars stats={data.match_prediction_stats} />
          )}
        </div>

        {/* Top scorer votes */}
        {data.player_vote_stats.length > 0 && (
          <TopScorerVotes stats={data.player_vote_stats} />
        )}

        {/* All predictions table */}
        {data.all_predictions.length > 0 && (
          <AllPredictionsTable
            rows={data.all_predictions}
            matches={data.matches}
          />
        )}

        {!tvMode && lastUpdated && (
          <p className="text-center text-xs text-gray-400 pb-4">
            Bijgewerkt om {lastUpdated.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-10 h-10 border-4 border-[#1b5e20] border-t-transparent rounded-full" />
        </div>
      }
    >
      <HomePageWithNav />
    </Suspense>
  );
}

function HomePageWithNav() {
  const searchParams = useSearchParams();
  const tvMode = searchParams.get("tv") === "true";

  if (tvMode) {
    return (
      <div className="bg-[#0a1a0a] min-h-screen text-white">
        <div className="bg-[#0d2b0d] border-b border-green-900 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-green-400 tracking-tight">VVKamerik Toto</h1>
          <span className="text-green-600 text-sm animate-pulse">● Live</span>
        </div>
        <DashboardContent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f0]">
      {/* Header */}
      <header className="bg-[#1b5e20] text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 border-b border-green-800/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="font-black text-lg tracking-tight">VVKamerik Toto</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/voorspellen"
                className="bg-white text-[#1b5e20] text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-50 transition-colors shadow-sm"
              >
                Doe mee →
              </a>
              <a
                href="/admin"
                className="text-green-300 text-sm hover:text-white transition-colors px-3 py-2"
              >
                Admin
              </a>
            </div>
          </div>

          <div className="py-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-green-200 text-sm">
              Live standen · Uitslagen · Voorspellingen
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <DashboardContent />
      </main>
    </div>
  );
}
