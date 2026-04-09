import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const { predicted_home_goals, predicted_away_goals, chosen_player_id } =
      await request.json();

    if (predicted_home_goals == null || predicted_away_goals == null) {
      return Response.json(
        { error: "Thuisgoals en uitgoals zijn verplicht" },
        { status: 400 }
      );
    }

    if (predicted_home_goals < 0 || predicted_away_goals < 0) {
      return Response.json(
        { error: "Goals mogen niet negatief zijn" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("predictions")
      .update({
        predicted_home_goals,
        predicted_away_goals,
        chosen_player_id: chosen_player_id || null,
      })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
