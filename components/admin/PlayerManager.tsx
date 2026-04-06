"use client";

import { useState, useEffect } from "react";
import type { Team, Player } from "@/lib/types";

interface PlayerManagerProps {
  token: string;
}

export default function PlayerManager({ token }: PlayerManagerProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Team[] = await res.json();
        const kamerikTeams = data.filter((t) => t.is_kamerik);
        setTeams(kamerikTeams);
        if (kamerikTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(kamerikTeams[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedTeam) fetchPlayers();
  }, [selectedTeam]);

  async function fetchPlayers() {
    try {
      const res = await fetch(`/api/admin/players/by-team?team_id=${selectedTeam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlayers(await res.json());
      }
    } catch {
      // ignore
    }
  }

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !selectedTeam) return;

    const res = await fetch("/api/admin/players", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: selectedTeam,
        name: newName.trim(),
        shirt_number: newNumber ? parseInt(newNumber) : null,
      }),
    });

    if (res.ok) {
      setNewName("");
      setNewNumber("");
      fetchPlayers();
    }
  }

  async function deletePlayer(id: string) {
    const res = await fetch("/api/admin/players", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      fetchPlayers();
    }
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Spelers</h2>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Maak eerst Kamerik-teams aan in het Teams-tabblad
        </p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={addPlayer} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Spelernaam"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nummer</label>
              <input
                type="number"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="#"
                min="0"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light"
            >
              Toevoegen
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm divide-y">
            {players.length === 0 && (
              <p className="p-4 text-gray-500 text-sm">Nog geen spelers voor dit team</p>
            )}
            {players.map((player) => (
              <div key={player.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {player.shirt_number != null && (
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {player.shirt_number}
                    </span>
                  )}
                  <span className="font-medium">{player.name}</span>
                </div>
                <button
                  onClick={() => deletePlayer(player.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Verwijder
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
