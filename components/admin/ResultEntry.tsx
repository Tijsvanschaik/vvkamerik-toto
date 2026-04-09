"use client";

import { useState, useEffect, useCallback } from "react";
import type { MatchWithTeams, Player } from "@/lib/types";

interface ResultEntryProps {
  token: string;
}

interface ScorerInput {
  player_id: string;
  goals: number;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type CancelStatus = "idle" | "saving" | "done" | "error";

interface MatchState {
  homeGoals: number;
  awayGoals: number;
  scorers: ScorerInput[];
  players: Player[];
  status: SaveStatus;
  errorMsg: string;
  isFinished: boolean;
  isCancelled: boolean;
  cancelledReason: string;
  cancelStatus: CancelStatus;
  cancelErrorMsg: string;
  showCancelConfirm: boolean;
  dirty: boolean;
}

export default function ResultEntry({ token }: ResultEntryProps) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [states, setStates] = useState<Record<string, MatchState>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) return;
      const data: MatchWithTeams[] = await res.json();
      setMatches(data);

      const { supabase } = await import("@/lib/supabase");

      const newStates: Record<string, MatchState> = {};
      await Promise.all(
        data.map(async (match) => {
          const [playersRes, scorersRes] = await Promise.all([
            fetch(`/api/matches/${match.id}/players`),
            supabase
              .from("match_scorers")
              .select("player_id, goals")
              .eq("match_id", match.id),
          ]);
          const players: Player[] = playersRes.ok ? await playersRes.json() : [];
          const scorers: ScorerInput[] = (scorersRes.data ?? []).map(
            (s: { player_id: string; goals: number }) => ({
              player_id: s.player_id,
              goals: s.goals,
            })
          );
          newStates[match.id] = {
            homeGoals: match.actual_home_goals ?? 0,
            awayGoals: match.actual_away_goals ?? 0,
            scorers,
            players,
            status: "idle",
            errorMsg: "",
            isFinished: match.is_finished,
            isCancelled: match.is_cancelled ?? false,
            cancelledReason: match.cancelled_reason ?? "",
            cancelStatus: "idle",
            cancelErrorMsg: "",
            showCancelConfirm: false,
            dirty: false,
          };
        })
      );
      setStates(newStates);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function patchState(matchId: string, patch: Partial<MatchState>, markDirty = true) {
    setStates((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], ...patch, ...(markDirty ? { dirty: true } : {}) },
    }));
  }

  function adjustGoals(matchId: string, side: "home" | "away", delta: number) {
    setStates((prev) => {
      const cur = prev[matchId];
      const key = side === "home" ? "homeGoals" : "awayGoals";
      const newVal = Math.max(0, cur[key] + delta);
      return { ...prev, [matchId]: { ...cur, [key]: newVal, dirty: true } };
    });
  }

  function addScorer(matchId: string) {
    const cur = states[matchId];
    patchState(matchId, { scorers: [...cur.scorers, { player_id: "", goals: 1 }] });
  }

  function removeScorer(matchId: string, idx: number) {
    const cur = states[matchId];
    patchState(matchId, { scorers: cur.scorers.filter((_, i) => i !== idx) });
  }

  function updateScorer(matchId: string, idx: number, field: keyof ScorerInput, value: string | number) {
    const cur = states[matchId];
    const updated = cur.scorers.map((s, i) => {
      if (i !== idx) return s;
      if (field === "goals") return { ...s, goals: Math.max(1, Number(value) || 1) };
      return { ...s, player_id: value as string };
    });
    patchState(matchId, { scorers: updated });
  }

  async function handleCancel(matchId: string, cancel: boolean) {
    const cur = states[matchId];
    setStates((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], cancelStatus: "saving", cancelErrorMsg: "", showCancelConfirm: false },
    }));

    try {
      const res = await fetch(`/api/admin/matches/${matchId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_cancelled: cancel,
          cancelled_reason: cancel ? cur.cancelledReason : null,
        }),
      });

      if (res.ok) {
        setStates((prev) => ({
          ...prev,
          [matchId]: { ...prev[matchId], isCancelled: cancel, cancelStatus: "done" },
        }));
        setTimeout(() =>
          setStates((prev) => ({
            ...prev,
            [matchId]: { ...prev[matchId], cancelStatus: "idle" },
          })), 2500
        );
      } else {
        const data = await res.json();
        setStates((prev) => ({
          ...prev,
          [matchId]: { ...prev[matchId], cancelStatus: "error", cancelErrorMsg: data.error || "Fout" },
        }));
      }
    } catch {
      setStates((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], cancelStatus: "error", cancelErrorMsg: "Er ging iets mis" },
      }));
    }
  }

  async function handleSave(matchId: string) {
    const cur = states[matchId];
    setStates((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], status: "saving", errorMsg: "" },
    }));

    try {
      const res = await fetch(`/api/admin/matches/${matchId}/result`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actual_home_goals: cur.homeGoals,
          actual_away_goals: cur.awayGoals,
          is_finished: cur.isFinished,
          scorers: cur.scorers.filter((s) => s.player_id),
        }),
      });

      if (res.ok) {
        setStates((prev) => ({
          ...prev,
          [matchId]: { ...prev[matchId], status: "saved", dirty: false },
        }));
        setTimeout(() =>
          setStates((prev) => ({
            ...prev,
            [matchId]: { ...prev[matchId], status: "idle" },
          })), 2500
        );
      } else {
        const data = await res.json();
        setStates((prev) => ({
          ...prev,
          [matchId]: { ...prev[matchId], status: "error", errorMsg: data.error || "Fout bij opslaan" },
        }));
      }
    } catch {
      setStates((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], status: "error", errorMsg: "Er ging iets mis" },
      }));
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-gray-400">Nog geen wedstrijden ingesteld.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Live invoer</p>
          <h2 className="text-xl font-bold text-gray-900">Uitslagen & scorers</h2>
        </div>
        <button
          onClick={fetchAll}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          ↻ Verversen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {matches.map((match) => {
          const s = states[match.id];
          if (!s) return null;

          const kamerikIsHome = match.kamerik_team?.id === match.home_team_id;
          const kamerikName = match.kamerik_team?.name ?? "VVKamerik";
          const opponentName = kamerikIsHome
            ? match.away_team?.name
            : match.home_team?.name;

          return (
            <div
              key={match.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                s.isCancelled
                  ? "border-orange-300 opacity-70"
                  : s.isFinished
                  ? "border-green-200"
                  : s.dirty
                  ? "border-[#1e3a8a]/30"
                  : "border-gray-100"
              }`}
            >
              {/* Card header */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{kamerikName}</p>
                    {s.isCancelled && (
                      <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Afgelast
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">vs {opponentName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!s.isCancelled && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-sm text-gray-500">Afgelopen</span>
                      <button
                        type="button"
                        onClick={() => patchState(match.id, { isFinished: !s.isFinished })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          s.isFinished ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            s.isFinished ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </label>
                  )}
                  {/* Cancel toggle button */}
                  {!s.isCancelled ? (
                    <button
                      type="button"
                      onClick={() => patchState(match.id, { showCancelConfirm: true }, false)}
                      className="text-xs text-orange-500 hover:text-orange-700 font-semibold transition-colors"
                      title="Markeer als afgelast"
                    >
                      Afgelasten
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCancel(match.id, false)}
                      disabled={s.cancelStatus === "saving"}
                      className="text-xs text-green-600 hover:text-green-800 font-semibold transition-colors"
                    >
                      {s.cancelStatus === "saving" ? "..." : "Herstellen"}
                    </button>
                  )}
                </div>
              </div>

              {/* Cancel confirmation dialog */}
              {s.showCancelConfirm && (
                <div className="px-5 py-4 bg-orange-50 border-b border-orange-100">
                  <p className="text-sm font-semibold text-orange-800 mb-2">
                    Wedstrijd afgelasten?
                  </p>
                  <p className="text-xs text-orange-600 mb-3">
                    Iedereen krijgt 0 punten voor deze wedstrijd — onderlinge standen blijven eerlijk.
                  </p>
                  <input
                    type="text"
                    placeholder="Reden (optioneel, bijv. slechte weersomstandigheden)"
                    value={s.cancelledReason}
                    onChange={(e) => setStates((prev) => ({
                      ...prev,
                      [match.id]: { ...prev[match.id], cancelledReason: e.target.value },
                    }))}
                    className="w-full mb-3 px-3 py-2 text-sm border border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel(match.id, true)}
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      Ja, afgelasten
                    </button>
                    <button
                      onClick={() => patchState(match.id, { showCancelConfirm: false }, false)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel status feedback */}
              {s.cancelStatus === "done" && (
                <div className="px-5 py-2 bg-orange-50 text-xs text-orange-700 font-semibold">
                  {s.isCancelled ? "✓ Wedstrijd gemarkeerd als afgelast" : "✓ Wedstrijd hersteld"}
                </div>
              )}
              {s.cancelStatus === "error" && (
                <div className="px-5 py-2 bg-red-50 text-xs text-red-600 font-semibold">
                  {s.cancelErrorMsg}
                </div>
              )}

              {/* Cancelled overlay message */}
              {s.isCancelled && (
                <div className="px-5 py-6 text-center">
                  <div className="text-3xl mb-2">🚫</div>
                  <p className="font-bold text-orange-700">Afgelast</p>
                  {s.cancelledReason && (
                    <p className="text-sm text-orange-500 mt-1">{s.cancelledReason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Iedereen krijgt 0 punten voor deze wedstrijd.
                    <br />Klik op &quot;Herstellen&quot; om de wedstrijd terug te zetten.
                  </p>
                </div>
              )}

              {/* Score row */}
              <div className={`px-5 py-5 ${s.isCancelled ? "hidden" : ""}`}>
                <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-3 text-center">
                  Stand
                </p>
                <div className="flex items-center justify-center gap-4">
                  {/* Kamerik goals */}
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400 font-medium">
                      {kamerikIsHome ? "Thuis" : "Uit"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjustGoals(match.id, kamerikIsHome ? "home" : "away", -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={kamerikIsHome ? s.homeGoals : s.awayGoals}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          patchState(match.id, kamerikIsHome ? { homeGoals: Math.max(0, val) } : { awayGoals: Math.max(0, val) });
                        }}
                        className="w-16 h-14 text-3xl font-black text-center border-2 border-gray-200 rounded-xl focus:border-[#1e3a8a] focus:outline-none tabular-nums"
                      />
                      <button
                        onClick={() => adjustGoals(match.id, kamerikIsHome ? "home" : "away", +1)}
                        className="w-8 h-8 rounded-lg bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white font-bold text-lg transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <span className="text-3xl font-black text-gray-200 mt-5">–</span>

                  {/* Opponent goals */}
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-gray-400 font-medium">
                      {kamerikIsHome ? "Uit" : "Thuis"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjustGoals(match.id, kamerikIsHome ? "away" : "home", -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={kamerikIsHome ? s.awayGoals : s.homeGoals}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          patchState(match.id, kamerikIsHome ? { awayGoals: Math.max(0, val) } : { homeGoals: Math.max(0, val) });
                        }}
                        className="w-16 h-14 text-3xl font-black text-center border-2 border-gray-200 rounded-xl focus:border-[#1e3a8a] focus:outline-none tabular-nums"
                      />
                      <button
                        onClick={() => adjustGoals(match.id, kamerikIsHome ? "away" : "home", +1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scorers */}
              <div className={`px-5 pb-4 border-t border-gray-50 pt-4 ${s.isCancelled ? "hidden" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">
                    Scorers ({kamerikName})
                  </p>
                  <button
                    onClick={() => addScorer(match.id)}
                    className="text-xs font-bold text-[#1e3a8a] hover:text-[#2d4fa8] transition-colors flex items-center gap-0.5"
                  >
                    + Toevoegen
                  </button>
                </div>

                {s.scorers.length === 0 && (
                  <p className="text-sm text-gray-300 italic">Geen scorers</p>
                )}

                <div className="space-y-2">
                  {s.scorers.map((scorer, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={scorer.player_id}
                        onChange={(e) => updateScorer(match.id, idx, "player_id", e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#1e3a8a] focus:outline-none bg-white"
                      >
                        <option value="">Kies speler...</option>
                        {s.players.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.shirt_number ? `#${p.shirt_number} ` : ""}{p.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateScorer(match.id, idx, "goals", scorer.goals - 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-black text-sm">{scorer.goals}</span>
                        <button
                          onClick={() => updateScorer(match.id, idx, "goals", scorer.goals + 1)}
                          className="w-7 h-7 rounded-lg bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white text-sm font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeScorer(match.id, idx)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-sm font-bold transition-colors flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div className={`px-5 pb-5 ${s.isCancelled ? "hidden" : ""}`}>
                {s.errorMsg && (
                  <p className="text-sm text-red-600 mb-2">{s.errorMsg}</p>
                )}
                <button
                  onClick={() => handleSave(match.id)}
                  disabled={s.status === "saving"}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    s.status === "saved"
                      ? "bg-green-500 text-white"
                      : s.status === "error"
                      ? "bg-red-500 text-white"
                      : s.dirty
                      ? "bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white"
                      : "bg-gray-100 text-gray-400 cursor-default"
                  }`}
                >
                  {s.status === "saving"
                    ? "Opslaan..."
                    : s.status === "saved"
                    ? "✓ Opgeslagen"
                    : s.status === "error"
                    ? "Fout — probeer opnieuw"
                    : s.dirty
                    ? "Opslaan"
                    : "Geen wijzigingen"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
