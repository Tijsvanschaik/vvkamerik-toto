"use client";

import { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  shirt_number: number | null;
}

interface PredictionRow {
  id: string;
  predicted_home_goals: number;
  predicted_away_goals: number;
  match_id: string;
  match: {
    id: string;
    match_order: number;
    home_team: { name: string };
    away_team: { name: string };
    kamerik_team_id: string;
    is_cancelled?: boolean;
  };
  chosen_player: { id: string; name: string; shirt_number: number | null } | null;
}

interface ParticipantWithPredictions {
  id: string;
  name: string;
  email: string | null;
  has_paid: boolean;
  created_at: string;
  predictions: PredictionRow[];
}

interface EditState {
  home: number;
  away: number;
  playerId: string;
  players: Player[];
  saving: boolean;
  saved: boolean;
  error: string;
}

interface PredictionsOverviewProps {
  token: string;
}

export default function PredictionsOverview({ token }: PredictionsOverviewProps) {
  const [participants, setParticipants] = useState<ParticipantWithPredictions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Map of predictionId → EditState (null means not in edit mode)
  const [editing, setEditing] = useState<Record<string, EditState | null>>({});

  useEffect(() => {
    fetchPredictions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPredictions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/predictions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setParticipants(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function togglePaid(participantId: string, currentPaid: boolean) {
    try {
      await fetch("/api/admin/participants", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: participantId, has_paid: !currentPaid }),
      });
      fetchPredictions();
    } catch {
      // ignore
    }
  }

  async function startEditing(pred: PredictionRow) {
    // Fetch players for this match's kamerik team
    let players: Player[] = [];
    try {
      const res = await fetch(`/api/matches/${pred.match.id}/players`);
      if (res.ok) players = await res.json();
    } catch {
      // ignore
    }

    setEditing((prev) => ({
      ...prev,
      [pred.id]: {
        home: pred.predicted_home_goals,
        away: pred.predicted_away_goals,
        playerId: pred.chosen_player?.id ?? "",
        players,
        saving: false,
        saved: false,
        error: "",
      },
    }));
  }

  function cancelEditing(predId: string) {
    setEditing((prev) => ({ ...prev, [predId]: null }));
  }

  function patchEdit(predId: string, patch: Partial<EditState>) {
    setEditing((prev) => ({
      ...prev,
      [predId]: prev[predId] ? { ...prev[predId]!, ...patch } : null,
    }));
  }

  async function savePrediction(predId: string) {
    const e = editing[predId];
    if (!e) return;

    patchEdit(predId, { saving: true, error: "" });

    try {
      const res = await fetch(`/api/admin/predictions/${predId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          predicted_home_goals: e.home,
          predicted_away_goals: e.away,
          chosen_player_id: e.playerId || null,
        }),
      });

      if (res.ok) {
        patchEdit(predId, { saving: false, saved: true });
        // Refresh data so the overview reflects the change
        await fetchPredictions();
        // Close edit mode after short delay
        setTimeout(() => {
          setEditing((prev) => ({ ...prev, [predId]: null }));
        }, 800);
      } else {
        const data = await res.json();
        patchEdit(predId, { saving: false, error: data.error || "Fout bij opslaan" });
      }
    } catch {
      patchEdit(predId, { saving: false, error: "Er ging iets mis" });
    }
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Beheer</p>
          <h2 className="text-xl font-bold text-gray-900">Inzendingen</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{participants.length} deelnemers</span>
          <button
            onClick={fetchPredictions}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↻ Verversen
          </button>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Nog geen inzendingen</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {participants.map((participant) => (
            <div key={participant.id}>
              {/* Participant row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === participant.id ? null : participant.id)
                }
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#1e3a8a]">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-900">{participant.name}</span>
                    {participant.email && (
                      <p className="text-xs text-gray-400 truncate">{participant.email}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                      participant.has_paid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {participant.has_paid ? "Betaald" : "Niet betaald"}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(participant.created_at).toLocaleString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-gray-300">{expandedId === participant.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === participant.id && (
                <div className="px-5 pb-5 space-y-3 bg-gray-50/50">
                  {/* Betaalstatus toggle */}
                  <div className="pt-3 pb-1">
                    <button
                      onClick={() => togglePaid(participant.id, participant.has_paid)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        participant.has_paid
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {participant.has_paid ? "Markeer als onbetaald" : "Markeer als betaald"}
                    </button>
                  </div>

                  {/* Predictions */}
                  {participant.predictions
                    ?.sort((a, b) => a.match.match_order - b.match.match_order)
                    .map((pred) => {
                      const e = editing[pred.id];
                      const isEditing = !!e;
                      const isCancelled = pred.match.is_cancelled;

                      return (
                        <div
                          key={pred.id}
                          className={`rounded-xl border transition-all ${
                            isCancelled
                              ? "bg-orange-50 border-orange-200 opacity-70"
                              : isEditing
                              ? "bg-white border-[#1e3a8a]/30 shadow-sm"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          {/* Match header */}
                          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-500">
                                {pred.match.home_team?.name} vs {pred.match.away_team?.name}
                              </p>
                              {isCancelled && (
                                <span className="text-[10px] font-bold text-orange-500">Afgelast</span>
                              )}
                            </div>
                            {!isCancelled && !isEditing && (
                              <button
                                onClick={() => startEditing(pred)}
                                className="text-xs text-[#1e3a8a] hover:text-[#2d4fa8] font-semibold transition-colors flex items-center gap-1"
                              >
                                ✏️ Aanpassen
                              </button>
                            )}
                            {isEditing && (
                              <button
                                onClick={() => cancelEditing(pred.id)}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                Annuleren
                              </button>
                            )}
                          </div>

                          {/* View mode */}
                          {!isEditing && (
                            <div className="px-4 pb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-gray-900 tabular-nums">
                                  {pred.predicted_home_goals}–{pred.predicted_away_goals}
                                </span>
                              </div>
                              {pred.chosen_player && (
                                <p className="text-xs text-gray-500">
                                  ⚽{" "}
                                  {pred.chosen_player.shirt_number
                                    ? `#${pred.chosen_player.shirt_number} `
                                    : ""}
                                  {pred.chosen_player.name}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Edit mode */}
                          {isEditing && e && (
                            <div className="px-4 pb-4 space-y-3">
                              {/* Score editors */}
                              <div className="flex items-center gap-4">
                                {/* Home goals */}
                                <div className="flex flex-col items-center gap-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                    {pred.match.home_team?.name}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => patchEdit(pred.id, { home: Math.max(0, e.home - 1) })}
                                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      title="Thuisgoals"
                                      value={e.home}
                                      onChange={(ev) =>
                                        patchEdit(pred.id, { home: Math.max(0, parseInt(ev.target.value) || 0) })
                                      }
                                      className="w-12 h-10 text-xl font-black text-center border-2 border-gray-200 rounded-lg focus:border-[#1e3a8a] focus:outline-none tabular-nums"
                                    />
                                    <button
                                      onClick={() => patchEdit(pred.id, { home: e.home + 1 })}
                                      className="w-7 h-7 rounded-lg bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white font-bold transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <span className="text-xl font-black text-gray-200 mt-4">–</span>

                                {/* Away goals */}
                                <div className="flex flex-col items-center gap-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                    {pred.match.away_team?.name}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => patchEdit(pred.id, { away: Math.max(0, e.away - 1) })}
                                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      title="Uitgoals"
                                      value={e.away}
                                      onChange={(ev) =>
                                        patchEdit(pred.id, { away: Math.max(0, parseInt(ev.target.value) || 0) })
                                      }
                                      className="w-12 h-10 text-xl font-black text-center border-2 border-gray-200 rounded-lg focus:border-[#1e3a8a] focus:outline-none tabular-nums"
                                    />
                                    <button
                                      onClick={() => patchEdit(pred.id, { away: e.away + 1 })}
                                      className="w-7 h-7 rounded-lg bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white font-bold transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Player picker */}
                              {e.players.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                    Topscoorder
                                  </p>
                                  <select
                                    title="Topscoorder kiezen"
                                    value={e.playerId}
                                    onChange={(ev) => patchEdit(pred.id, { playerId: ev.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#1e3a8a] focus:outline-none bg-white"
                                  >
                                    <option value="">— Geen speler —</option>
                                    {e.players.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.shirt_number ? `#${p.shirt_number} ` : ""}{p.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Error */}
                              {e.error && (
                                <p className="text-xs text-red-600">{e.error}</p>
                              )}

                              {/* Save */}
                              <button
                                onClick={() => savePrediction(pred.id)}
                                disabled={e.saving}
                                className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
                                  e.saved
                                    ? "bg-green-500 text-white"
                                    : "bg-[#1e3a8a] hover:bg-[#2d4fa8] text-white disabled:opacity-60"
                                }`}
                              >
                                {e.saving ? "Opslaan..." : e.saved ? "✓ Opgeslagen" : "Opslaan"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
