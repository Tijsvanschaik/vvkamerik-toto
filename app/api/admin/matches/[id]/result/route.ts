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
    const { actual_home_goals, actual_away_goals, is_finished, scorers } =
      await request.json();

    if (actual_home_goals == null || actual_away_goals == null) {
      return Response.json(
        { error: "Thuisgoals en uitgoals zijn verplicht" },
        { status: 400 }
      );
    }

    if (actual_home_goals < 0 || actual_away_goals < 0) {
      return Response.json(
        { error: "Goals mogen niet negatief zijn" },
        { status: 400 }
      );
    }

    const { error: matchError } = await supabaseAdmin
      .from("matches")
      .update({
        actual_home_goals,
        actual_away_goals,
        is_finished: is_finished ?? true,
      })
      .eq("id", id);

    if (matchError) {
      return Response.json({ error: matchError.message }, { status: 500 });
    }

    if (scorers && Array.isArray(scorers)) {
      await supabaseAdmin.from("match_scorers").delete().eq("match_id", id);

      if (scorers.length > 0) {
        const scorerRows = scorers.map(
          (s: { player_id: string; goals: number }) => ({
            match_id: id,
            player_id: s.player_id,
            goals: s.goals || 1,
          })
        );

        const { error: scorerError } = await supabaseAdmin
          .from("match_scorers")
          .insert(scorerRows);

        if (scorerError) {
          return Response.json({ error: scorerError.message }, { status: 500 });
        }
      }
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
