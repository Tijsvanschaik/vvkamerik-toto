import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("predictions_open, tikkie_url, entry_fee, points_correct_winner, points_correct_home_goals, points_correct_away_goals, points_exact_score_bonus, points_topscorer_base, points_topscorer_min, prize_1st, prize_2nd, prize_3rd")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
