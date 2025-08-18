export const runtime = "nodejs";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, successUrl, cancelUrl, customerEmail } = body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY env" }),
        { status: 500 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), {
        status: 400,
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });

    const line_items = items.map((it) => ({
      price_data: {
        currency: "php",
        product_data: { name: it.title || it.flowerType || "Item" },
        unit_amount: Math.round((Number(it.price) || 0) * 100),
      },
      quantity: Math.max(1, Number(it.quantity) || 1),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: customerEmail || undefined,
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      shipping_address_collection: {
        allowed_countries: ["PH", "US", "CA", "GB"],
      },
    });

    return new Response(JSON.stringify({ id: session.id, url: session.url }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
