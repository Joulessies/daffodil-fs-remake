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

export async function DELETE(request, { params }) {
  try {
    console.log("[DELETE /api/admin/users/:id] Request:", {
      userId: params.id,
    });

    const admin = getAdminClient();
    if (!admin) {
      console.error("[DELETE /api/admin/users/:id] Missing admin client");
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    }

    // Get user info before deletion
    let userEmail = null;
    try {
      const { data: user } = await admin
        .from("users")
        .select("email, is_admin")
        .eq("id", params.id)
        .maybeSingle();

      if (user) {
        userEmail = user.email;

        // Prevent deleting the last admin
        if (user.is_admin) {
          const { data: admins } = await admin
            .from("users")
            .select("id")
            .eq("is_admin", true);

          if (admins && admins.length <= 1) {
            return new Response(
              JSON.stringify({
                error: "Cannot delete the last admin account",
              }),
              { status: 400 }
            );
          }
        }
      }
    } catch (e) {
      console.error("[DELETE /api/admin/users/:id] Error fetching user:", e);
    }

    // Delete from users table
    const { error } = await admin.from("users").delete().eq("id", params.id);

    if (error) {
      console.error("[DELETE /api/admin/users/:id] Supabase error:", error);
      throw error;
    }

    // Optionally delete from auth (be careful with this in production)
    try {
      if (admin.auth?.admin?.deleteUser) {
        await admin.auth.admin.deleteUser(params.id);
        console.log(
          "[DELETE /api/admin/users/:id] Auth user deleted successfully"
        );
      }
    } catch (err) {
      console.error(
        "[DELETE /api/admin/users/:id] Error deleting auth user:",
        err
      );
      // Don't fail if auth deletion fails - we already deleted from users table
    }

    await writeAudit({
      action: "delete",
      entity: "user",
      entityId: params.id,
      data: { email: userEmail },
    });

    console.log("[DELETE /api/admin/users/:id] Success!");

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/admin/users/:id] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
