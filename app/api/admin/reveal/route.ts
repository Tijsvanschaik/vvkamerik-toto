import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "").toString("base64");
  return token === expected;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("settings")
    .select("standings_visible")
    .single();

  return NextResponse.json({
    standings_visible: data?.standings_visible !== false,
  });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { standings_visible } = await req.json() as { standings_visible: boolean };

  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("id")
    .single();

  if (!settings) {
    return NextResponse.json({ error: "Settings niet gevonden" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .update({ standings_visible })
    .eq("id", settings.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, standings_visible });
}
