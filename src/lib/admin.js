import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) return null;

  let selectedKey = serviceKey || anonKey;
  if (serviceKey && url) {
    try {
      const parts = serviceKey.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        const urlRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        if (urlRef && payload.ref && payload.ref !== urlRef) {
          selectedKey = anonKey;
        }
      }
    } catch {}
  }

  if (!selectedKey) return null;
  return createClient(url, selectedKey);
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
