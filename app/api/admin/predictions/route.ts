import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { data: participants, error: partError } = await supabaseAdmin
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false });

    if (partError) {
      return Response.json({ error: partError.message }, { status: 500 });
    }

    const { data: predictions, error: predError } = await supabaseAdmin
      .from("predictions")
      .select("*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)), chosen_player:players(*)");

    if (predError) {
      return Response.json({ error: predError.message }, { status: 500 });
    }

    const result = participants?.map((participant) => ({
      ...participant,
      predictions: predictions?.filter(
        (p) => p.participant_id === participant.id
      ),
    }));

    return Response.json(result);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
