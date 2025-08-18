export const runtime = "nodejs";
import { getAccessToken } from "../_utils";

export async function POST(request) {
  try {
    const { items = [], currency = "PHP", customer } = await request.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), {
        status: 400,
      });
    }
    const total = items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
      0
    );
    const { accessToken, base } = await getAccessToken();
    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: total.toFixed(2),
            },
          },
        ],
        payer: customer || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Create order failed");
    return new Response(JSON.stringify({ id: data.id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
