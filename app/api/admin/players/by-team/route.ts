import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const teamId = request.nextUrl.searchParams.get("team_id");

    if (!teamId) {
      return Response.json({ error: "team_id is verplicht" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("shirt_number", { nullsFirst: false })
      .order("name");

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
