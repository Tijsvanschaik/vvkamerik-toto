import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "").toString("base64");
  return token === expected;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { is_cancelled: boolean; cancelled_reason?: string };

  const { error } = await supabaseAdmin
    .from("matches")
    .update({
      is_cancelled: body.is_cancelled,
      cancelled_reason: body.is_cancelled ? (body.cancelled_reason ?? null) : null,
      // Als wedstrijd hersteld wordt, ook is_finished resetten
      ...(body.is_cancelled === false ? { is_finished: false } : {}),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
