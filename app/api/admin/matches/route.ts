import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { id, match_order, home_team_id, away_team_id, kamerik_team_id } =
      await request.json();

    if (!home_team_id || !away_team_id || !kamerik_team_id) {
      return Response.json(
        { error: "Thuisteam, uitteam en Kamerik-team zijn verplicht" },
        { status: 400 }
      );
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("matches")
        .update({ match_order, home_team_id, away_team_id, kamerik_team_id })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(data);
    }

    const { data, error } = await supabaseAdmin
      .from("matches")
      .insert({ match_order, home_team_id, away_team_id, kamerik_team_id })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
