import { validateAdminToken, unauthorizedResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { id, name, is_kamerik } = await request.json();

    if (!name) {
      return Response.json({ error: "Teamnaam is verplicht" }, { status: 400 });
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("teams")
        .update({ name, is_kamerik: is_kamerik ?? false })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(data);
    }

    const { data, error } = await supabaseAdmin
      .from("teams")
      .insert({ name, is_kamerik: is_kamerik ?? false })
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

export async function GET(request: NextRequest) {
  try {
    if (!(await validateAdminToken(request))) {
      return unauthorizedResponse();
    }

    const { data, error } = await supabaseAdmin
      .from("teams")
      .select("*")
      .order("is_kamerik", { ascending: false })
      .order("name");

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
