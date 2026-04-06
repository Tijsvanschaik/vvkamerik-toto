import { supabaseAdmin } from "@/lib/supabase-server";
import { mollieClient } from "@/lib/mollie";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get("id") as string;

    if (!paymentId) {
      return Response.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const payment = await mollieClient.payments.get(paymentId);

    if (payment.status === "paid") {
      const metadata = payment.metadata as { participant_id?: string };

      if (metadata?.participant_id) {
        await supabaseAdmin
          .from("participants")
          .update({
            has_paid: true,
            mollie_payment_id: paymentId,
          })
          .eq("id", metadata.participant_id);
      }
    }

    return new Response(null, { status: 200 });
  } catch {
    return Response.json({ error: "Webhook error" }, { status: 500 });
  }
}
