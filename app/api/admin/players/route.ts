import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    if (Array.isArray(body)) {
      const players = body.map((p) => ({
        team_id: p.team_id,
        name: p.name,
        shirt_number: p.shirt_number ?? null,
      }));

      const { data, error } = await supabaseAdmin
        .from("players")
        .insert(players)
        .select();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json(data, { status: 201 });
    }

    const { id, team_id, name, shirt_number } = body;

    if (!name || !team_id) {
      return Response.json(
        { error: "Naam en team_id zijn verplicht" },
        { status: 400 }
      );
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("players")
        .update({ name, team_id, shirt_number: shirt_number ?? null })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(data);
    }

    const { data, error } = await supabaseAdmin
      .from("players")
      .insert({ team_id, name, shirt_number: shirt_number ?? null })
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

export async function DELETE(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "ID is verplicht" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("players").delete().eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
