"use client";

import { useState, useEffect } from "react";
import type { Team, MatchWithTeams } from "@/lib/types";

interface MatchManagerProps {
  token: string;
}

export default function MatchManager({ token }: MatchManagerProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [kamerikTeamId, setKamerikTeamId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [teamsRes, matchesRes] = await Promise.all([
        fetch("/api/admin/teams", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/matches"),
      ]);

      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function addMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || !kamerikTeamId) return;

    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        match_order: matches.length + 1,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        kamerik_team_id: kamerikTeamId,
      }),
    });

    if (res.ok) {
      setHomeTeamId("");
      setAwayTeamId("");
      setKamerikTeamId("");
      fetchData();
    }
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  const kamerikTeams = teams.filter((t) => t.is_kamerik);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Wedstrijden</h2>

      {teams.length < 2 ? (
        <p className="text-gray-500 text-sm">Maak eerst minstens 2 teams aan</p>
      ) : (
        <form onSubmit={addMatch} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thuisteam</label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              >
                <option value="">Kies...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uitteam</label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              >
                <option value="">Kies...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kamerik-team</label>
              <select
                value={kamerikTeamId}
                onChange={(e) => setKamerikTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              >
                <option value="">Kies...</option>
                {kamerikTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light"
          >
            Wedstrijd toevoegen
          </button>
        </form>
      )}

      <div className="space-y-2">
        {matches.length === 0 && (
          <p className="text-gray-500 text-sm">Nog geen wedstrijden</p>
        )}
        {matches.map((match, index) => (
          <div
            key={match.id}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-mono w-6">#{index + 1}</span>
              <span className="font-medium">
                {match.home_team?.name ?? "?"} vs {match.away_team?.name ?? "?"}
              </span>
              {match.is_finished && (
                <span className="text-sm text-green-600 font-medium">
                  {match.actual_home_goals} - {match.actual_away_goals}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              Kamerik: {match.kamerik_team?.name ?? "?"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
