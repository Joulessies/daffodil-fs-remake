export const runtime = "nodejs";

export async function GET() {
  try {
    const key =
      process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing HUGGINGFACE_API_KEY" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const res = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ ok: false, status: res.status, error: text }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, user: { name: data.name, type: data.type } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
