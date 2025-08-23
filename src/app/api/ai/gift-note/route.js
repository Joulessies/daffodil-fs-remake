export const runtime = "nodejs";

export async function POST() {
  return new Response(
    JSON.stringify({ error: "Gift note generation is disabled." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}
