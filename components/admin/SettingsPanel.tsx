"use client";

import { useState, useEffect } from "react";
import type { Settings } from "@/lib/types";

interface SettingsPanelProps {
  token: string;
}

export default function SettingsPanel({ token }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entry_fee: settings.entry_fee,
          prize_1st: settings.prize_1st,
          prize_2nd: settings.prize_2nd,
          prize_3rd: settings.prize_3rd,
          prize_pct_club: settings.prize_pct_club,
          points_correct_winner: settings.points_correct_winner,
          points_correct_home_goals: settings.points_correct_home_goals,
          points_correct_away_goals: settings.points_correct_away_goals,
          points_exact_score_bonus: settings.points_exact_score_bonus,
          points_topscorer_base: settings.points_topscorer_base,
          points_topscorer_min: settings.points_topscorer_min,
          predictions_open: settings.predictions_open,
          tikkie_url: settings.tikkie_url,
        }),
      });

      if (res.ok) {
        setSettings(await res.json());
        setMessage("Settings opgeslagen!");
      } else {
        setMessage("Fout bij opslaan");
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

  if (!settings) {
    return <p className="text-red-500">Kon settings niet laden</p>;
  }

  function updateField(field: keyof Settings, value: unknown) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Instellingen</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </div>

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

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Voorspellingen open</h3>
            <p className="text-sm text-gray-500">Deelnemers kunnen voorspellingen indienen</p>
          </div>
          <button
            onClick={() => updateField("predictions_open", !settings.predictions_open)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.predictions_open ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.predictions_open ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inleg (EUR)</label>
          <input
            type="number"
            step="0.50"
            min="0"
            value={settings.entry_fee}
            onChange={(e) => updateField("entry_fee", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tikkie URL</label>
          <input
            type="url"
            value={settings.tikkie_url || ""}
            onChange={(e) => updateField("tikkie_url", e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="https://tikkie.me/..."
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Prijzen (vaste bedragen in EUR)</h3>
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                ["prize_1st", "1e plaats"],
                ["prize_2nd", "2e plaats"],
                ["prize_3rd", "3e plaats"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={settings[field] ?? 0}
                    onChange={(e) => updateField(field, parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Puntenwaarden</h3>
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                ["points_correct_winner", "Correcte winnaar"],
                ["points_correct_home_goals", "Juiste thuisgoals"],
                ["points_correct_away_goals", "Juiste uitgoals"],
                ["points_exact_score_bonus", "Exacte score bonus"],
                ["points_topscorer_base", "Topscoorder basis"],
                ["points_topscorer_min", "Topscoorder minimum"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={settings[field]}
                  onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
