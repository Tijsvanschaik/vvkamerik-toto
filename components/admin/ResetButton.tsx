"use client";

import { useState } from "react";

interface ResetButtonProps {
  token: string;
}

export default function ResetButton({ token }: ResetButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [keepTeams, setKeepTeams] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReset() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keep_teams: keepTeams }),
      });

      if (res.ok) {
        setMessage("Reset voltooid! De pagina wordt herladen...");
        setConfirming(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || "Reset mislukt");
      }
    } catch {
      setMessage("Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Reset</h2>

      {message && (
        <div
          className={`px-4 py-2 rounded-lg text-sm ${
            message.includes("voltooid")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
        >
          Nieuwe ronde starten
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
          <p className="font-medium text-red-800">
            Weet je zeker dat je alles wilt wissen?
          </p>
          <p className="text-sm text-red-600">
            Dit verwijdert alle voorspellingen, deelnemers, uitslagen en scorers.
          </p>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={keepTeams}
              onChange={(e) => setKeepTeams(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">Teams en spelers behouden</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Bezig..." : "Ja, alles wissen"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              Annuleer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
