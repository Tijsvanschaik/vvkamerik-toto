import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json({ error: "Wachtwoord is verplicht" }, { status: 400 });
    }

    const { data: settings, error } = await supabaseAdmin
      .from("settings")
      .select("admin_password")
      .single();

    if (error || !settings) {
      return Response.json({ error: "Kon settings niet ophalen" }, { status: 500 });
    }

    if (password !== settings.admin_password) {
      return Response.json({ error: "Onjuist wachtwoord" }, { status: 401 });
    }

    const token = btoa(password);
    return Response.json({ token });
  } catch {
    return Response.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
