"use client";

import { useState, useEffect } from "react";
import type { MatchWithTeams, PublicSettings } from "@/lib/types";
import MatchPredictionCard from "@/components/form/MatchPredictionCard";
import ParticipantNameInput from "@/components/form/ParticipantNameInput";
import SubmitButton from "@/components/form/SubmitButton";
import ClosedBanner from "@/components/form/ClosedBanner";
import TikkieLink from "@/components/form/TikkieLink";

interface PredictionState {
  predicted_home_goals: string;
  predicted_away_goals: string;
  chosen_player_id: string;
}

export default function VoorspellenPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [predictions, setPredictions] = useState<PredictionState[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, matchesRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/matches"),
        ]);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (matchesRes.ok) {
          const matchData = await matchesRes.json();
          setMatches(matchData);
          setPredictions(
            matchData.map(() => ({
              predicted_home_goals: "",
              predicted_away_goals: "",
              chosen_player_id: "",
            }))
          );
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function updatePrediction(index: number, field: string, value: string) {
    setPredictions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${index}_home`];
      delete updated[`${index}_away`];
      delete updated[`${index}_player`];
      return updated;
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.first_name = "Vul je voornaam in";
    if (!lastName.trim()) newErrors.last_name = "Vul je achternaam in";
    if (!email.trim()) {
      newErrors.email = "Vul je e-mailadres in";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Vul een geldig e-mailadres in";
    }
    predictions.forEach((pred, i) => {
      const h = parseInt(pred.predicted_home_goals);
      const a = parseInt(pred.predicted_away_goals);
      if (pred.predicted_home_goals === "" || isNaN(h) || h < 0)
        newErrors[`${i}_home`] = "Verplicht";
      if (pred.predicted_away_goals === "" || isNaN(a) || a < 0)
        newErrors[`${i}_away`] = "Verplicht";
      if (!pred.chosen_player_id) newErrors[`${i}_player`] = "Kies een speler";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_name: `${firstName.trim()} ${lastName.trim()}`,
          participant_email: email.trim(),
          predictions: predictions.map((pred, i) => ({
            match_id: matches[i].id,
            predicted_home_goals: parseInt(pred.predicted_home_goals),
            predicted_away_goals: parseInt(pred.predicted_away_goals),
            chosen_player_id: pred.chosen_player_id,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ form: data.error }); return; }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        window.location.href = `/confirmation?participant_id=${data.participant_id}`;
      }
    } catch {
      setErrors({ form: "Er ging iets mis bij het versturen" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a8a] text-white shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
            ← Dashboard
          </a>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex flex-col items-center justify-center">
              <span className="text-[10px] font-black leading-none text-[#1e3a8a]">VV</span>
              <span className="text-[7px] font-bold leading-none tracking-widest text-blue-400 uppercase">VVK</span>
            </div>
            <span className="font-black text-base tracking-tight">VV Kamerik Toto</span>
          </div>
          <a href="/admin" className="text-blue-300 hover:text-white text-sm font-medium transition-colors">Admin</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {settings && !settings.predictions_open ? (
          <ClosedBanner />
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-400">Er zijn nog geen wedstrijden ingesteld.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Doe mee!</h2>
              <p className="text-sm text-gray-500 mb-4">
                Voorspel alle {matches.length} wedstrijden en kies een topscoorder.
                {settings && <> Inleg: <strong>€{Number(settings.entry_fee).toFixed(2)}</strong>.</>}
              </p>
              <ParticipantNameInput
                firstName={firstName}
                lastName={lastName}
                email={email}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onEmailChange={setEmail}
                errors={errors}
              />
            </div>

            {errors.form && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">
                {errors.form}
              </div>
            )}

            {matches.map((match, index) => (
              <MatchPredictionCard
                key={match.id}
                match={match}
                index={index}
                prediction={predictions[index]}
                onChange={(field, value) => updatePrediction(index, field, value)}
                errors={errors}
              />
            ))}

            {settings?.tikkie_url && <TikkieLink url={settings.tikkie_url} />}

            <SubmitButton loading={submitting} entryFee={settings?.entry_fee ?? 5} />
          </form>
        )}
      </main>
    </div>
  );
}
