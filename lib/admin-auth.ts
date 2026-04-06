import { supabaseAdmin } from "@/lib/supabase-server";

export async function validateAdminToken(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = atob(token);
    const { data } = await supabaseAdmin
      .from("settings")
      .select("admin_password")
      .single();

    if (!data) return false;
    return decoded === data.admin_password;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
