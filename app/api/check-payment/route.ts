import { supabaseAdmin } from "@/lib/supabase-server";
import { mollieClient } from "@/lib/mollie";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { participant_id } = await request.json();

    if (!participant_id) {
      return Response.json({ error: "participant_id is verplicht" }, { status: 400 });
    }

    const { data: participant, error } = await supabaseAdmin
      .from("participants")
      .select("id, has_paid, mollie_payment_id")
      .eq("id", participant_id)
      .single();

    if (error || !participant) {
      return Response.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
    }

    if (participant.has_paid) {
      return Response.json({ has_paid: true });
    }

    if (!participant.mollie_payment_id) {
      return Response.json({ has_paid: false });
    }

    const payment = await mollieClient.payments.get(participant.mollie_payment_id);

    if (payment.status === "paid") {
      await supabaseAdmin
        .from("participants")
        .update({ has_paid: true })
        .eq("id", participant_id);

      return Response.json({ has_paid: true });
    }

    return Response.json({ has_paid: false, payment_status: payment.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[check-payment] fout:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
