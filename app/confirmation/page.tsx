"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";

interface ParticipantInfo {
  name: string;
  has_paid: boolean;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const participantId = searchParams.get("participant_id");
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const isPaidRef = useRef(false);

  useEffect(() => {
    if (!participantId) {
      setLoading(false);
      return;
    }

    async function checkStatus() {
      try {
        // Vraag Mollie-status op en update database indien betaald
        const verifyRes = await fetch("/api/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant_id: participantId }),
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.has_paid !== undefined) {
            const { supabase } = await import("@/lib/supabase");
            const { data } = await supabase
              .from("participants")
              .select("name, has_paid")
              .eq("id", participantId)
              .single();
            if (data) {
              setParticipant(data);
              if (data.has_paid) isPaidRef.current = true;
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
    // Poll elke 4 seconden totdat betaling bevestigd is
    const interval = setInterval(async () => {
      if (isPaidRef.current) return;
      await checkStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [participantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!participantId || !participant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Geen deelnemer gevonden.</p>
        <a
          href="/"
          className="inline-block mt-4 text-primary font-medium hover:underline"
        >
          Terug naar het formulier
        </a>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {participant.has_paid ? (
        <>
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-green-700">
            Betaling ontvangen!
          </h2>
          <p className="text-lg text-gray-700">
            Bedankt, <strong>{participant.name}</strong>! Je doet mee aan de VVKamerik Toto.
          </p>
          <p className="text-gray-500">
            Je voorspellingen zijn opgeslagen. Bekijk het leaderboard zodra de uitslagen bekend zijn.
          </p>
        </>
      ) : (
        <>
          <div className="text-6xl">⏳</div>
          <h2 className="text-2xl font-bold text-yellow-700">
            Wachten op betaling...
          </h2>
          <p className="text-lg text-gray-700">
            <strong>{participant.name}</strong>, je voorspellingen zijn opgeslagen.
          </p>
          <p className="text-gray-500">
            We wachten nog op de bevestiging van je betaling. Dit kan even duren.
            Deze pagina ververst automatisch.
          </p>
        </>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <a
          href="/"
          className="bg-[#1b5e20] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#2e7d32] transition-colors"
        >
          Naar het dashboard
        </a>
        <a
          href="/voorspellen"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          Nog een keer meedoen
        </a>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold">VVKamerik Toto</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}
