"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { LeaderboardEntry } from "@/lib/types";
import MatchCards, { type MatchCardData } from "@/components/dashboard/MatchCards";
import PodiumSection from "@/components/dashboard/PodiumSection";
import RankingTable from "@/components/dashboard/RankingTable";
import PrizePotCard from "@/components/dashboard/PrizePotCard";
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
  match_prediction_stats: MatchCardData[];
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ── VVKamerik text logo ───────────────────────────────────────────────────────
function VVKLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border-2 ${
          inverted ? "bg-[#1e3a8a] border-blue-900" : "bg-white border-blue-100"
        }`}
      >
        <span className={`text-[11px] font-black leading-none tracking-tight ${inverted ? "text-white" : "text-[#1e3a8a]"}`}>
          VV
        </span>
        <span className={`text-[9px] font-bold leading-none tracking-widest uppercase ${inverted ? "text-blue-300" : "text-blue-400"}`}>
          VVK
        </span>
      </div>
      <div className="leading-tight">
        <p className={`text-base font-black tracking-tight leading-none ${inverted ? "text-white" : "text-[#1e3a8a]"}`}>
          VV Kamerik
        </p>
        <p className={`text-[11px] font-semibold tracking-widest uppercase leading-none mt-0.5 ${inverted ? "text-blue-300" : "text-blue-400"}`}>
          Toto
        </p>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-[3px] border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Header stats chips ────────────────────────────────────────────────────────
function HeaderStats({ data }: { data: DashboardData }) {
  const { participant_count, settings } = data;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-5 pb-2">
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white">
        <span className="text-blue-300 text-sm">Deelnemers</span>
        <span className="font-black text-lg">{participant_count}</span>
      </div>
      <div className="h-6 w-px bg-white/20 hidden sm:block" />
      {[
        { label: "1e prijs", value: settings.prize_1st, icon: "🥇" },
        { label: "2e prijs", value: settings.prize_2nd, icon: "🥈" },
        { label: "3e prijs", value: settings.prize_3rd, icon: "🥉" },
      ].map(({ label, value, icon }) => (
        <div key={label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white">
          <span className="text-base">{icon}</span>
          <span className="text-blue-300 text-sm">{label}</span>
          <span className="font-black text-lg">{fmt(value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard sections ────────────────────────────────────────────────────────
function DashboardSections({ data, tvMode }: { data: DashboardData; tvMode: boolean }) {
  const [confettiShown, setConfettiShown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, [data]);

  useEffect(() => {
    if (data.all_finished && !confettiShown && data.leaderboard.length > 0) {
      setConfettiShown(true);
      import("canvas-confetti").then((m) =>
        m.default({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.3 },
          colors: ["#1e3a8a", "#93c5fd", "#ffffff"],
        })
      );
    }
  }, [data.all_finished, confettiShown, data.leaderboard.length]);

  const top3 = data.leaderboard.slice(0, 3);
  const prizes = {
    prize_1st: data.settings.prize_1st,
    prize_2nd: data.settings.prize_2nd,
    prize_3rd: data.settings.prize_3rd,
  };

  const leaderboardSection = (
    <>
      {data.has_finished && top3.length > 0 && (
        <PodiumSection top3={top3} prizes={prizes} allFinished={data.all_finished} />
      )}
      <RankingTable entries={data.leaderboard} />
    </>
  );

  const topScorerSection = data.player_vote_stats.length > 0 ? (
    <TopScorerVotes stats={data.player_vote_stats} />
  ) : null;

  const predictionsSection = data.all_predictions.length > 0 ? (
    <AllPredictionsTable rows={data.all_predictions} matches={data.matches} />
  ) : null;

  return (
    <div className="space-y-8">
      {/* Wedstrijdkaarten — altijd bovenaan */}
      {data.match_prediction_stats.length > 0 && (
        <MatchCards matches={data.match_prediction_stats} />
      )}

      {/* Topscoorders — altijd na wedstrijdkaarten */}
      {topScorerSection}

      {/*
        Dynamische volgorde:
        - Nog niet gespeeld → voorspellingen eerst, ranglijst daarna
        - Gespeeld          → ranglijst + podium eerst, voorspellingen daarna
      */}
      {data.has_finished ? (
        <>
          {leaderboardSection}
          {predictionsSection}
        </>
      ) : (
        <>
          {predictionsSection}
          {leaderboardSection}
        </>
      )}

      {!tvMode && lastUpdated && (
        <p className="text-center text-xs text-gray-400 pb-4">
          Bijgewerkt om{" "}
          {lastUpdated.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

// ── Data shell (fetches + auto-refreshes) ─────────────────────────────────────
function PageShell({ tvMode }: { tvMode: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
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

  if (tvMode) {
    return (
      <div className="bg-[#0a0f1e] min-h-screen text-white">
        <div className="border-b border-blue-900/40 px-6 py-3 flex items-center justify-between">
          <VVKLogo />
          <span className="text-blue-500 text-xs animate-pulse font-medium">● Live</span>
        </div>
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {loading || !data ? <Spinner /> : <DashboardSections data={data} tvMode={tvMode} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-[#1e3a8a]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-5 flex items-center justify-between">
          <VVKLogo inverted />
          <div className="flex items-center gap-2">
            <a
              href="/voorspellen"
              className="bg-white text-[#1e3a8a] text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Doe mee →
            </a>
            <a
              href="/admin"
              className="text-blue-300 hover:text-white text-sm font-medium transition-colors px-2 py-2"
            >
              Admin
            </a>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-blue-300 text-base">
            Live standen · Uitslagen · Voorspellingen
          </p>
        </div>

        {/* Stats chips — tonen zodra data geladen */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-8">
          {data ? (
            <HeaderStats data={data} />
          ) : (
            <div className="pt-5 pb-2 flex justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-[1400px] mx-auto w-full px-6 sm:px-10 py-8 flex-1">
        {loading || !data ? <Spinner /> : <DashboardSections data={data} tvMode={tvMode} />}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} VV Kamerik Toto</span>
          <div className="flex items-center gap-4">
            <a href="/voorspellen" className="hover:text-gray-600 transition-colors">Voorspellen</a>
            <a href="/admin" className="hover:text-gray-600 transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function RouterWrapper() {
  const searchParams = useSearchParams();
  const tvMode = searchParams.get("tv") === "true";
  return <PageShell tvMode={tvMode} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RouterWrapper />
    </Suspense>
  );
}
