"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { LeaderboardEntry } from "@/lib/types";
import MatchResultBanner from "@/components/leaderboard/MatchResultBanner";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";

interface MatchInfo {
  id: string;
  match_order: number;
  home_team_name: string;
  away_team_name: string;
  actual_home_goals: number | null;
  actual_away_goals: number | null;
  is_finished: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  matches: MatchInfo[];
  settings: {
    entry_fee: number;
    prize_1st: number;
    prize_2nd: number;
    prize_3rd: number;
  };
  total_pot?: number;
  all_finished?: boolean;
  message?: string;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const tvMode = searchParams.get("tv") === "true";
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confettiShown, setConfettiShown] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (tvMode) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, tvMode]);

  useEffect(() => {
    if (data?.all_finished && !confettiShown && data.leaderboard.length > 0) {
      setConfettiShown(true);
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#1e3a8a", "#93c5fd", "#ffffff"],
        });
      });
    }
  }, [data?.all_finished, confettiShown, data?.leaderboard.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Kon het leaderboard niet laden.
      </div>
    );
  }

  const top3 = data.leaderboard.slice(0, 3);
  const pot = data.total_pot ?? 0;

  function getPrize(rank: number): string {
    if (!data) return "€0";
    const amount =
      rank === 1
        ? data.settings.prize_1st
        : rank === 2
        ? data.settings.prize_2nd
        : data.settings.prize_3rd;
    return `€${Number(amount).toFixed(2)}`;
  }

  function handleShare() {
    const text = `VVKamerik Toto — Bekijk het leaderboard! ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className={tvMode ? "tv-mode bg-[#0a1a0a] text-white min-h-screen" : "min-h-screen bg-background"}>
      {!tvMode && (
        <header className="bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center">
            <h1 className="text-2xl font-bold">VVKamerik Toto</h1>
            <p className="text-white/70 text-sm mt-1">Leaderboard</p>
          </div>
        </header>
      )}

      <main className={`mx-auto px-4 py-6 space-y-8 ${tvMode ? "max-w-6xl" : "max-w-4xl"}`}>
        {tvMode && (
          <div className="text-center pt-4">
            <h1 className="text-4xl font-bold text-blue-300">VV Kamerik Toto</h1>
          </div>
        )}

        <section>
          <MatchResultBanner matches={data.matches} tvMode={tvMode} />
        </section>

        {top3.length > 0 && data.leaderboard.some((e) => e.total_points > 0) && (
          <section>
            <div className={`flex items-end justify-center gap-4 ${tvMode ? "gap-6 py-8" : "py-4"}`}>
              {top3.length >= 2 && (
                <div className={`text-center ${tvMode ? "w-44" : "w-32"}`}>
                  <div className={`bg-gray-100 rounded-t-2xl flex flex-col items-center justify-end ${tvMode ? "h-36 py-4" : "h-28 py-3"} ${tvMode ? "" : "bg-gray-100"}`}>
                    <span className={`font-bold text-gray-400 ${tvMode ? "text-3xl" : "text-2xl"}`}>2</span>
                    <p className={`font-semibold truncate px-2 ${tvMode ? "text-lg text-white" : ""}`}>
                      {top3[1].participant_name}
                    </p>
                    <p className={`font-bold text-primary ${tvMode ? "text-2xl" : "text-lg"}`}>
                      {top3[1].total_points} pt
                    </p>
                    {data.all_finished && (
                      <p className="text-xs text-gray-500">{getPrize(2)}</p>
                    )}
                  </div>
                </div>
              )}

              {top3.length >= 1 && (
                <div className={`text-center ${tvMode ? "w-52" : "w-36"}`}>
                  <div className={`bg-yellow-50 border-2 border-yellow-300 rounded-t-2xl flex flex-col items-center justify-end ${tvMode ? "h-48 py-6" : "h-36 py-4"}`}>
                    <span className={`font-bold text-yellow-500 ${tvMode ? "text-4xl" : "text-3xl"}`}>1</span>
                    <p className={`font-bold truncate px-2 ${tvMode ? "text-xl text-white" : ""}`}>
                      {top3[0].participant_name}
                    </p>
                    <p className={`font-bold text-primary ${tvMode ? "text-3xl" : "text-xl"}`}>
                      {top3[0].total_points} pt
                    </p>
                    {data.all_finished && (
                      <p className="text-sm text-yellow-700 font-medium">{getPrize(1)}</p>
                    )}
                  </div>
                </div>
              )}

              {top3.length >= 3 && (
                <div className={`text-center ${tvMode ? "w-40" : "w-28"}`}>
                  <div className={`bg-amber-50 rounded-t-2xl flex flex-col items-center justify-end ${tvMode ? "h-28 py-3" : "h-24 py-2"}`}>
                    <span className={`font-bold text-amber-700 ${tvMode ? "text-2xl" : "text-xl"}`}>3</span>
                    <p className={`font-semibold truncate px-2 text-sm ${tvMode ? "text-base text-white" : ""}`}>
                      {top3[2].participant_name}
                    </p>
                    <p className={`font-bold text-primary ${tvMode ? "text-xl" : "text-lg"}`}>
                      {top3[2].total_points} pt
                    </p>
                    {data.all_finished && (
                      <p className="text-xs text-gray-500">{getPrize(3)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className={`font-bold mb-4 ${tvMode ? "text-2xl text-blue-300" : "text-xl"}`}>
            Ranglijst
          </h2>
          <LeaderboardTable entries={data.leaderboard} tvMode={tvMode} />
        </section>

        {!tvMode && (
          <section className="text-center pb-8">
            <button
              onClick={handleShare}
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2d4fa8] transition-colors text-sm"
            >
              Deel je score
            </button>
          </section>
        )}

        {!tvMode && (
          <footer className="text-center text-sm text-gray-400 pb-8">
            <a href="/" className="hover:text-primary transition-colors">
              Dashboard
            </a>
            <span className="mx-2">&middot;</span>
            <a href="/voorspellen" className="hover:text-primary transition-colors">
              Doe mee
            </a>
            <span className="mx-2">&middot;</span>
            <a href="/admin" className="hover:text-primary transition-colors">
              Admin
            </a>
          </footer>
        )}
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
