import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import type { PredictionSubmission } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: PredictionSubmission = await request.json();

    if (!body.participant_name?.trim()) {
      return Response.json({ error: "Naam is verplicht" }, { status: 400 });
    }
    if (!body.participant_email?.trim()) {
      return Response.json({ error: "E-mailadres is verplicht" }, { status: 400 });
    }

    if (!body.predictions || body.predictions.length === 0) {
      return Response.json(
        { error: "Je moet alle wedstrijden invullen" },
        { status: 400 }
      );
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("predictions_open, entry_fee")
      .single();

    if (!settings?.predictions_open) {
      return Response.json(
        { error: "Voorspellingen zijn gesloten" },
        { status: 403 }
      );
    }

    const { data: matches } = await supabaseAdmin
      .from("matches")
      .select("id, is_cancelled")
      .order("match_order");

    if (!matches) {
      return Response.json({ error: "Geen wedstrijden gevonden" }, { status: 404 });
    }

    const activeMatches = matches.filter((m) => !m.is_cancelled);

    if (body.predictions.length !== activeMatches.length) {
      return Response.json(
        { error: `Je moet alle ${activeMatches.length} wedstrijden invullen` },
        { status: 400 }
      );
    }

    // Zorg dat niemand een voorspelling instuurt voor een afgelaste wedstrijd
    const cancelledIds = new Set(matches.filter((m) => m.is_cancelled).map((m) => m.id));
    for (const pred of body.predictions) {
      if (cancelledIds.has(pred.match_id)) {
        return Response.json(
          { error: "Je kunt geen voorspelling doen voor een afgelaste wedstrijd" },
          { status: 400 }
        );
      }
    }

    for (const pred of body.predictions) {
      if (pred.predicted_home_goals < 0 || pred.predicted_away_goals < 0) {
        return Response.json(
          { error: "Goals mogen niet negatief zijn" },
          { status: 400 }
        );
      }
      if (
        !Number.isInteger(pred.predicted_home_goals) ||
        !Number.isInteger(pred.predicted_away_goals)
      ) {
        return Response.json(
          { error: "Goals moeten hele getallen zijn" },
          { status: 400 }
        );
      }
      if (!pred.chosen_player_id) {
        return Response.json(
          { error: "Je moet voor elke wedstrijd een topscoorder kiezen" },
          { status: 400 }
        );
      }
    }

    const { data: participant, error: partError } = await supabaseAdmin
      .from("participants")
      .insert({
        name: body.participant_name.trim(),
        email: body.participant_email.trim(),
        has_paid: false,
      })
      .select()
      .single();

    if (partError || !participant) {
      return Response.json(
        { error: "Kon deelnemer niet aanmaken" },
        { status: 500 }
      );
    }

    const predictionRows = body.predictions.map((pred) => ({
      participant_id: participant.id,
      match_id: pred.match_id,
      predicted_home_goals: pred.predicted_home_goals,
      predicted_away_goals: pred.predicted_away_goals,
      chosen_player_id: pred.chosen_player_id,
    }));

    const { error: predError } = await supabaseAdmin
      .from("predictions")
      .insert(predictionRows);

    if (predError) {
      await supabaseAdmin.from("participants").delete().eq("id", participant.id);
      return Response.json(
        { error: "Kon voorspellingen niet opslaan" },
        { status: 500 }
      );
    }

    const { mollieClient } = await import("@/lib/mollie");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    try {
      const paymentParams: Parameters<typeof mollieClient.payments.create>[0] = {
        amount: {
          currency: "EUR",
          value: Number(settings.entry_fee).toFixed(2),
        },
        description: `VVKamerik Toto - ${body.participant_name.trim()}`,
        redirectUrl: `${appUrl}/confirmation?participant_id=${participant.id}`,
        metadata: {
          participant_id: participant.id,
        },
      };

      // Mollie vereist een publieke HTTPS URL als webhookUrl — skip bij localhost
      if (!isLocalhost) {
        paymentParams.webhookUrl = `${appUrl}/api/webhooks/mollie`;
      }

      const payment = await mollieClient.payments.create(paymentParams);

      await supabaseAdmin
        .from("participants")
        .update({ mollie_payment_id: payment.id })
        .eq("id", participant.id);

      const checkoutUrl = payment.getCheckoutUrl();
      return Response.json({
        participant_id: participant.id,
        checkout_url: checkoutUrl,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[Mollie] Betaling aanmaken mislukt:", errorMessage);
      return Response.json({
        participant_id: participant.id,
        checkout_url: null,
        mollie_error: errorMessage,
        message: "Voorspelling opgeslagen, maar betaling kon niet worden gestart.",
      });
    }
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
