import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("kamerik_team_id")
      .eq("id", id)
      .single();

    if (matchError || !match) {
      return Response.json({ error: "Wedstrijd niet gevonden" }, { status: 404 });
    }

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", match.kamerik_team_id)
      .order("shirt_number", { nullsFirst: false })
      .order("name");

    if (playersError) {
      return Response.json({ error: playersError.message }, { status: 500 });
    }

    return Response.json(players);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
