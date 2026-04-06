"use client";

import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import SettingsPanel from "@/components/admin/SettingsPanel";
import TeamManager from "@/components/admin/TeamManager";
import PlayerManager from "@/components/admin/PlayerManager";
import MatchManager from "@/components/admin/MatchManager";
import ResultEntry from "@/components/admin/ResultEntry";
import PredictionsOverview from "@/components/admin/PredictionsOverview";
import ResetButton from "@/components/admin/ResetButton";

type Tab =
  | "settings"
  | "teams"
  | "players"
  | "matches"
  | "results"
  | "predictions"
  | "reset";

const tabs: { id: Tab; label: string }[] = [
  { id: "settings", label: "Instellingen" },
  { id: "teams", label: "Teams" },
  { id: "players", label: "Spelers" },
  { id: "matches", label: "Wedstrijden" },
  { id: "results", label: "Uitslagen" },
  { id: "predictions", label: "Inzendingen" },
  { id: "reset", label: "Reset" },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
    }
    setCheckingAuth(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">VVKamerik Toto — Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-white/80 hover:text-white"
          >
            Uitloggen
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex gap-1 overflow-x-auto pb-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "settings" && <SettingsPanel token={token} />}
        {activeTab === "teams" && <TeamManager token={token} />}
        {activeTab === "players" && <PlayerManager token={token} />}
        {activeTab === "matches" && <MatchManager token={token} />}
        {activeTab === "results" && <ResultEntry token={token} />}
        {activeTab === "predictions" && <PredictionsOverview token={token} />}
        {activeTab === "reset" && <ResetButton token={token} />}
      </div>
    </div>
  );
}
