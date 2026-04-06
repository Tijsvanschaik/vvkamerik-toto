"use client";

import { useState, useEffect } from "react";
import type { Team } from "@/lib/types";

interface TeamManagerProps {
  token: string;
}

export default function TeamManager({ token }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isKamerik, setIsKamerik] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIsKamerik, setEditIsKamerik] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const res = await fetch("/api/admin/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeams(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function addTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName.trim(), is_kamerik: isKamerik }),
    });

    if (res.ok) {
      setNewName("");
      setIsKamerik(false);
      fetchTeams();
    }
  }

  async function saveEdit(id: string) {
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name: editName.trim(), is_kamerik: editIsKamerik }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchTeams();
    }
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Teams</h2>

      <form onSubmit={addTeam} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw team</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Teamnaam"
          />
        </div>
        <label className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            checked={isKamerik}
            onChange={(e) => setIsKamerik(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm">Kamerik</span>
        </label>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light"
        >
          Toevoegen
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {teams.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">Nog geen teams</p>
        )}
        {teams.map((team) => (
          <div key={team.id} className="p-4 flex items-center justify-between">
            {editingId === team.id ? (
              <div className="flex gap-2 items-center flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg outline-none"
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editIsKamerik}
                    onChange={(e) => setEditIsKamerik(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm">Kamerik</span>
                </label>
                <button
                  onClick={() => saveEdit(team.id)}
                  className="text-sm text-primary font-medium"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-gray-500"
                >
                  Annuleer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{team.name}</span>
                  {team.is_kamerik && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Kamerik
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingId(team.id);
                    setEditName(team.name);
                    setEditIsKamerik(team.is_kamerik);
                  }}
                  className="text-sm text-gray-500 hover:text-primary"
                >
                  Bewerk
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
