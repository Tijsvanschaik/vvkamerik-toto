"use client";

import { useState, useEffect } from "react";
import type { MatchWithTeams, Player } from "@/lib/types";

interface ResultEntryProps {
  token: string;
}

interface ScorerInput {
  player_id: string;
  goals: number;
}

export default function ResultEntry({ token }: ResultEntryProps) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [scorers, setScorers] = useState<ScorerInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedMatch) {
      const match = matches.find((m) => m.id === selectedMatch);
      if (match) {
        setHomeGoals(match.actual_home_goals?.toString() ?? "");
        setAwayGoals(match.actual_away_goals?.toString() ?? "");
        fetchPlayers(match.id);
        fetchExistingScorers(match.id);
      }
    }
  }, [selectedMatch]);

  async function fetchPlayers(matchId: string) {
    try {
      const res = await fetch(`/api/matches/${matchId}/players`);
      if (res.ok) {
        setPlayers(await res.json());
      }
    } catch {
      // ignore
    }
  }

  async function fetchExistingScorers(matchId: string) {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("match_scorers")
        .select("player_id, goals")
        .eq("match_id", matchId);
      if (data && data.length > 0) {
        setScorers(data.map((s: { player_id: string; goals: number }) => ({ player_id: s.player_id, goals: s.goals })));
      } else {
        setScorers([]);
      }
    } catch {
      setScorers([]);
    }
  }

  function addScorer() {
    setScorers([...scorers, { player_id: "", goals: 1 }]);
  }

  function removeScorer(index: number) {
    setScorers(scorers.filter((_, i) => i !== index));
  }

  function updateScorer(index: number, field: keyof ScorerInput, value: string | number) {
    const updated = [...scorers];
    if (field === "goals") {
      updated[index].goals = typeof value === "number" ? value : parseInt(value) || 1;
    } else {
      updated[index].player_id = value as string;
    }
    setScorers(updated);
  }

  async function handleSave() {
    if (!selectedMatch || homeGoals === "" || awayGoals === "") return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/matches/${selectedMatch}/result`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actual_home_goals: parseInt(homeGoals),
          actual_away_goals: parseInt(awayGoals),
          is_finished: true,
          scorers: scorers.filter((s) => s.player_id),
        }),
      });

      if (res.ok) {
        setMessage("Uitslag opgeslagen!");
        fetchMatches();
      } else {
        const data = await res.json();
        setMessage(data.error || "Fout bij opslaan");
      }
    } catch {
      setMessage("Er ging iets mis");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  const currentMatch = matches.find((m) => m.id === selectedMatch);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Uitslagen invoeren</h2>

      {matches.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen wedstrijden</p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wedstrijd</label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Kies een wedstrijd...</option>
              {matches.map((match, i) => (
                <option key={match.id} value={match.id}>
                  #{i + 1} {match.home_team?.name} vs {match.away_team?.name}
                  {match.is_finished ? " (afgelopen)" : ""}
                </option>
              ))}
            </select>
          </div>

          {currentMatch && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              {message && (
                <div
                  className={`px-4 py-2 rounded-lg text-sm ${
                    message.includes("Fout") || message.includes("mis")
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-right">
                  <p className="font-medium">{currentMatch.home_team?.name}</p>
                  <input
                    type="number"
                    min="0"
                    value={homeGoals}
                    onChange={(e) => setHomeGoals(e.target.value)}
                    className="w-20 ml-auto mt-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div className="text-center text-2xl font-bold text-gray-300">-</div>
                <div>
                  <p className="font-medium">{currentMatch.away_team?.name}</p>
                  <input
                    type="number"
                    min="0"
                    value={awayGoals}
                    onChange={(e) => setAwayGoals(e.target.value)}
                    className="w-20 mt-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Scorers (VVKamerik)</h3>
                  <button
                    onClick={addScorer}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    + Scorer toevoegen
                  </button>
                </div>

                {scorers.length === 0 && (
                  <p className="text-sm text-gray-400">Geen scorers (of 0-0)</p>
                )}

                {scorers.map((scorer, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <select
                      value={scorer.player_id}
                      onChange={(e) => updateScorer(index, "player_id", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="">Kies speler...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.shirt_number ? `#${p.shirt_number} ` : ""}
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={scorer.goals}
                      onChange={(e) => updateScorer(index, "goals", e.target.value)}
                      className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <span className="text-sm text-gray-500">goals</span>
                    <button
                      onClick={() => removeScorer(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-light disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Uitslag opslaan"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
