export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";

export async function GET() {
  try {
    const admin = getAdminClient();
    if (!admin)
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    // 1) Load auth users from Supabase Auth
    // Attempt to fetch up to 1000 users (adjust if needed)
    let authUsers = [];
    try {
      const { data } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      authUsers = data?.users || [];
    } catch (e) {
      // If admin.auth fails, fall back to empty list
      authUsers = [];
    }

    // 2) Load role flags from our app table
    const { data: roleRows } = await admin
      .from("users")
      .select("id, email, is_admin, suspended");
    const byId = new Map((roleRows || []).map((r) => [String(r.id), r]));

    // 3) Merge: prefer auth users as source of truth for identity
    const merged = (authUsers || []).map((u) => {
      const r = byId.get(String(u.id)) || null;
      return {
        id: u.id,
        email: u.email,
        is_admin: r?.is_admin || false,
        suspended: r?.suspended || false,
      };
    });

    // 4) If there are entries in our table that aren't in auth (rare), include them too
    for (const r of roleRows || []) {
      if (!merged.find((m) => String(m.id) === String(r.id))) {
        merged.push({
          id: r.id,
          email: r.email,
          is_admin: !!r.is_admin,
          suspended: !!r.suspended,
        });
      }
    }

    // Sort by email
    merged.sort((a, b) =>
      String(a.email || "").localeCompare(String(b.email || ""))
    );

    return new Response(JSON.stringify({ items: merged }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
