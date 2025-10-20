export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    console.log("[PATCH /api/admin/users/:id] Request:", {
      userId: params.id,
      body,
    });

    const admin = getAdminClient();
    if (!admin) {
      console.error("[PATCH /api/admin/users/:id] Missing admin client");
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    }

    const updates = {};
    if (body.is_admin !== undefined) updates.is_admin = !!body.is_admin;
    if (body.suspended !== undefined) updates.suspended = !!body.suspended;

    console.log("[PATCH /api/admin/users/:id] Updates to apply:", updates);

    let { data, error } = await admin
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select("id, email, is_admin, suspended")
      .limit(1)
      .maybeSingle();

    console.log("[PATCH /api/admin/users/:id] Update result:", { data, error });

    if (error) {
      console.error("[PATCH /api/admin/users/:id] Supabase error:", error);
      throw error;
    }

    if (!data) {
      console.log(
        "[PATCH /api/admin/users/:id] User not found in table, creating new record"
      );

      let email = null;
      try {
        if (admin.auth?.admin?.getUserById) {
          const { data: au } = await admin.auth.admin.getUserById(params.id);
          email = au?.user?.email || null;
          console.log(
            "[PATCH /api/admin/users/:id] Fetched email from auth:",
            email
          );
        }
      } catch (e) {
        console.error(
          "[PATCH /api/admin/users/:id] Error fetching user from auth:",
          e
        );
      }

      const toInsert = {
        id: params.id,
        email,
        is_admin: updates.is_admin ?? false,
        suspended: updates.suspended ?? false,
      };

      console.log("[PATCH /api/admin/users/:id] Upserting record:", toInsert);

      const up = await admin
        .from("users")
        .upsert(toInsert, { onConflict: "id" })
        .select("id, email, is_admin, suspended")
        .single();

      console.log("[PATCH /api/admin/users/:id] Upsert result:", {
        data: up.data,
        error: up.error,
      });

      if (up.error) throw up.error;
      data = up.data;
    }

    // If suspended toggled, also block/unblock auth user
    try {
      if (body.suspended !== undefined && admin.auth?.admin) {
        if (body.suspended) {
          await admin.auth.admin.updateUserById(params.id, { banned: true });
        } else {
          await admin.auth.admin.updateUserById(params.id, { banned: false });
        }
      }
    } catch (err) {
      console.error(
        "[PATCH /api/admin/users/:id] Error updating auth user:",
        err
      );
    }

    await writeAudit({
      action: "update",
      entity: "user",
      entityId: params.id,
      data: updates,
    });

    console.log("[PATCH /api/admin/users/:id] Success! Final data:", data);

    return new Response(JSON.stringify({ user: data }), { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
