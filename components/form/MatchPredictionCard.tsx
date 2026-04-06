"use client";

import { useState, useEffect } from "react";
import type { Player, MatchWithTeams } from "@/lib/types";

interface MatchPredictionCardProps {
  match: MatchWithTeams;
  index: number;
  prediction: {
    predicted_home_goals: string;
    predicted_away_goals: string;
    chosen_player_id: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function MatchPredictionCard({
  match,
  index,
  prediction,
  onChange,
  errors,
}: MatchPredictionCardProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch(`/api/matches/${match.id}/players`);
        if (res.ok) {
          setPlayers(await res.json());
        }
      } catch {
        // ignore
      }
    }
    fetchPlayers();
  }, [match.id]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-4 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-primary">Wedstrijd {index + 1}</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="text-center">
            <p className="font-semibold text-gray-900 mb-2">{match.home_team?.name}</p>
            <input
              type="number"
              min="0"
              value={prediction.predicted_home_goals}
              onChange={(e) => onChange("predicted_home_goals", e.target.value)}
              className={`w-20 mx-auto px-3 py-3 border rounded-xl text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                errors[`${index}_home`] ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="0"
            />
          </div>

          <span className="text-2xl font-bold text-gray-300 pt-6">-</span>

          <div className="text-center">
            <p className="font-semibold text-gray-900 mb-2">{match.away_team?.name}</p>
            <input
              type="number"
              min="0"
              value={prediction.predicted_away_goals}
              onChange={(e) => onChange("predicted_away_goals", e.target.value)}
              className={`w-20 mx-auto px-3 py-3 border rounded-xl text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                errors[`${index}_away`] ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topscoorder ({match.kamerik_team?.name})
          </label>
          <select
            value={prediction.chosen_player_id}
            onChange={(e) => onChange("chosen_player_id", e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
              errors[`${index}_player`] ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">Kies een speler...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.shirt_number ? `#${player.shirt_number} ` : ""}
                {player.name}
              </option>
            ))}
          </select>
          {errors[`${index}_player`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${index}_player`]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
