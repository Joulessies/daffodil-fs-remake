import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function writeAudit({ actorId, action, entity, entityId, data }) {
  try {
    const admin = getAdminClient();
    if (!admin) return;
    await admin.from("admin_audit").insert({
      actor_id: actorId || null,
      action,
      entity,
      entity_id: entityId || null,
      data: data ? JSON.stringify(data) : null,
    });
  } catch {}
}

export function getAdminEmails() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(String(email).toLowerCase());
}
