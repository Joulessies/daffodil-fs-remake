export const runtime = "nodejs";

// Creates a PayMongo Checkout Session and returns its checkout URL
// Docs (approximate): POST https://api.paymongo.com/v1/checkout_sessions
// Requires PAYMONGO_SECRET_KEY in server env. Uses sandbox when key is test (sk_test_...).

function basicAuth(secretKey) {
  // PayMongo uses HTTP Basic with the secret key as username and empty password
  // Authorization: Basic base64(`${secretKey}:`)
  return "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
}

export async function POST(request) {
  try {
    const { items, customerEmail, successUrl, cancelUrl, paymentMethodTypes } =
      (await request.json()) || {};

    if (!process.env.PAYMONGO_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing PAYMONGO_SECRET_KEY env" }),
        { status: 500 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), {
        status: 400,
      });
    }

    // Build line items in centavos
    const line_items = items.map((it) => ({
      name: it.title || it.flowerType || "Item",
      amount: Math.round((Number(it.price) || 0) * 100),
      currency: "PHP",
      quantity: Math.max(1, Number(it.quantity) || 1),
    }));

    // Generate a merchant reference for reconciliation
    const reference_number = `pm_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const origin = request.headers.get("origin");
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || "";

    const attributes = {
      line_items,
      payment_method_types:
        Array.isArray(paymentMethodTypes) && paymentMethodTypes.length
          ? paymentMethodTypes
          : ["card", "gcash", "paymaya", "grab_pay"],
      reference_number,
      description: "Daffodil Flower Shop Order",
      success_url:
        successUrl ||
        `${baseUrl}/order/confirmation?pm_ref=${encodeURIComponent(
          reference_number
        )}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout`,
      billing: customerEmail
        ? {
            email: customerEmail,
          }
        : undefined,
    };

    const res = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth(process.env.PAYMONGO_SECRET_KEY),
        Accept: "application/json",
      },
      body: JSON.stringify({ data: { attributes } }),
    });

    const json = await res.json();
    if (!res.ok) {
      const message =
        json?.errors?.[0]?.detail || json?.error || "Failed to create session";
      return new Response(JSON.stringify({ error: message, raw: json }), {
        status: 500,
      });
    }

    const id = json?.data?.id;
    const url = json?.data?.attributes?.checkout_url;
    if (!id || !url) {
      return new Response(
        JSON.stringify({ error: "Invalid response from PayMongo", json }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ id, url, reference: reference_number }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
