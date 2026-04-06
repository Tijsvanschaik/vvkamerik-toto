import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { keep_teams } = await request.json().catch(() => ({ keep_teams: true }));

    await supabaseAdmin.from("predictions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("match_scorers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("participants").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    await supabaseAdmin
      .from("matches")
      .update({ actual_home_goals: null, actual_away_goals: null, is_finished: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (!keep_teams) {
      await supabaseAdmin.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabaseAdmin.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabaseAdmin.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    await supabaseAdmin
      .from("settings")
      .update({ predictions_open: true })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
