"use client";

import { useState, useEffect } from "react";
import type { MatchWithTeams, PublicSettings } from "@/lib/types";

function InstructionsCard({ s }: { s: PublicSettings }) {
  const [open, setOpen] = useState(false);
  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📋</span>
          <div>
            <p className="font-bold text-gray-900">Hoe werkt het?</p>
            <p className="text-sm text-gray-400">Spelregels en puntentelling</p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-50">
          {/* Hoe meedoen */}
          <div className="pt-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-2">Hoe doe je mee?</p>
            <ol className="space-y-1.5 text-sm text-gray-600">
              <li className="flex gap-2"><span className="font-bold text-[#1e3a8a] w-4 flex-shrink-0">1.</span>Vul je naam en e-mailadres in</li>
              <li className="flex gap-2"><span className="font-bold text-[#1e3a8a] w-4 flex-shrink-0">2.</span>Voorspel de uitslag van alle {5} wedstrijden</li>
              <li className="flex gap-2"><span className="font-bold text-[#1e3a8a] w-4 flex-shrink-0">3.</span>Kies per wedstrijd een topscoorder uit het VVKamerik-elftal</li>
              <li className="flex gap-2"><span className="font-bold text-[#1e3a8a] w-4 flex-shrink-0">4.</span>Betaal de inleg van <strong>€{Number(s.entry_fee).toFixed(2)}</strong> via iDEAL</li>
            </ol>
          </div>

          {/* Puntentelling */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-2">Puntentelling per wedstrijd</p>
            <div className="space-y-1.5">
              {[
                { label: "Juiste winnaar (thuis/gelijk/uit)", pts: s.points_correct_winner },
                { label: "Juiste aantal thuisgoals", pts: s.points_correct_home_goals },
                { label: "Juiste aantal uitgoals", pts: s.points_correct_away_goals },
                { label: "Exacte uitslag bonus", pts: s.points_exact_score_bonus },
              ].map(({ label, pts }) => (
                <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="font-black text-[#1e3a8a] text-sm">+{pts} pt</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topscoorder */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-2">Topscoorder bonus</p>
            <div className="bg-gray-50 rounded-lg px-3 py-3 text-sm text-gray-600 space-y-1">
              <p>Kies je een speler die scoort? Dan verdien je punten per goal:</p>
              <p className="font-medium text-gray-800">
                Punten per goal = {s.points_topscorer_base} ÷ aantal mensen dat dezelfde speler koos
              </p>
              <p className="text-gray-400 text-xs">Minimum {s.points_topscorer_min} punt per goal. Kies een &apos;sleeper&apos; en je pakt meer punten!</p>
            </div>
          </div>

          {/* Prijzen */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-2">Prijzen</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🥇", label: "1e plaats", prize: s.prize_1st },
                { icon: "🥈", label: "2e plaats", prize: s.prize_2nd },
                { icon: "🥉", label: "3e plaats", prize: s.prize_3rd },
              ].map(({ icon, label, prize }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl">{icon}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  <p className="font-black text-[#1e3a8a] text-base">{fmt(prize)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

            {settings && <InstructionsCard s={settings} />}

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
