"use client";

import { useState, useEffect } from "react";

interface ParticipantWithPredictions {
  id: string;
  name: string;
  has_paid: boolean;
  created_at: string;
  predictions: {
    id: string;
    predicted_home_goals: number;
    predicted_away_goals: number;
    match: {
      match_order: number;
      home_team: { name: string };
      away_team: { name: string };
    };
    chosen_player: { name: string; shirt_number: number | null } | null;
  }[];
}

interface PredictionsOverviewProps {
  token: string;
}

export default function PredictionsOverview({ token }: PredictionsOverviewProps) {
  const [participants, setParticipants] = useState<ParticipantWithPredictions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  async function fetchPredictions() {
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

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Inzendingen</h2>
        <span className="text-sm text-gray-500">{participants.length} deelnemers</span>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen inzendingen</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {participants.map((participant) => (
            <div key={participant.id}>
              <button
                onClick={() =>
                  setExpandedId(expandedId === participant.id ? null : participant.id)
                }
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{participant.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      participant.has_paid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {participant.has_paid ? "Betaald" : "Niet betaald"}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(participant.created_at).toLocaleString("nl-NL")}
                </span>
              </button>

              {expandedId === participant.id && (
                <div className="px-4 pb-4 space-y-2">
                  <button
                    onClick={() => togglePaid(participant.id, participant.has_paid)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium ${
                      participant.has_paid
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {participant.has_paid ? "Markeer als onbetaald" : "Markeer als betaald"}
                  </button>

                  {participant.predictions
                    ?.sort((a, b) => a.match.match_order - b.match.match_order)
                    .map((pred) => (
                      <div
                        key={pred.id}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {pred.match.home_team?.name} vs {pred.match.away_team?.name}
                          </span>
                          <span className="font-medium">
                            {pred.predicted_home_goals} - {pred.predicted_away_goals}
                          </span>
                        </div>
                        {pred.chosen_player && (
                          <p className="text-gray-500 mt-1">
                            Topscoorder:{" "}
                            {pred.chosen_player.shirt_number
                              ? `#${pred.chosen_player.shirt_number} `
                              : ""}
                            {pred.chosen_player.name}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
