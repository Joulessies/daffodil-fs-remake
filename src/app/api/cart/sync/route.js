export const runtime = "nodejs";
import { getAdminClient } from "@/lib/admin";

if (!globalThis.DAFFODIL_SYNCED_CARTS) {
  globalThis.DAFFODIL_SYNCED_CARTS = new Map();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const identifier = (searchParams.get("identifier") || searchParams.get("email") || "default").toLowerCase();

  let items = [];

  if (globalThis.DAFFODIL_SYNCED_CARTS.has(identifier)) {
    items = globalThis.DAFFODIL_SYNCED_CARTS.get(identifier);
  }

  if (items.length === 0) {
    try {
      const admin = getAdminClient();
      if (admin) {
        const { data: userRecord } = await admin
          .from("users")
          .select("avatar_url")
          .eq("email", identifier)
          .maybeSingle();
      }
    } catch (e) {}
  }

  return new Response(JSON.stringify({ identifier, items, count: items.length }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || "default").toLowerCase();
    const items = Array.isArray(body.items) ? body.items : [];

    globalThis.DAFFODIL_SYNCED_CARTS.set(identifier, items);

    if (identifier !== "default") {
      globalThis.DAFFODIL_SYNCED_CARTS.set("default", items);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cart synchronized across Mobile and Web",
        identifier,
        count: items.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
