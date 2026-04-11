import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const updates = await request.json();

    const allowedFields = [
      "entry_fee",
      "prize_1st",
      "prize_2nd",
      "prize_3rd",
      "prize_pct_club",
      "points_correct_winner",
      "points_correct_home_goals",
      "points_correct_away_goals",
      "points_exact_score_bonus",
      "points_topscorer_base",
      "points_topscorer_min",
      "predictions_open",
      "tikkie_url",
      "standings_visible",
    ];

    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        filtered[key] = updates[key];
      }
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("id")
      .single();

    if (!settings) {
      return Response.json({ error: "Geen settings gevonden" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("settings")
      .update(filtered)
      .eq("id", settings.id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
