export const runtime = "nodejs";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { email, name, address, items, total } = await request.json();

    // Basic validation
    if (!email || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing email or items" }), {
        status: 400,
      });
    }

    // Handle stock reduction if Supabase is configured
    let stockError = null;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE
    ) {
      try {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE
        );

        // Reduce stock for each item
        for (const item of items) {
          const qty = Math.max(1, Number(item.quantity) || 1);
          let productId = item.id;

          // Try to find product by ID first, then by title
          if (!productId && item.title) {
            const { data: prodByTitle } = await admin
              .from("products")
              .select("id, stock")
              .eq("title", item.title)
              .maybeSingle();
            if (prodByTitle) productId = prodByTitle.id;
          }

          if (productId) {
            // Try to use the stock movement function first
            let moved = false;
            try {
              const { error: rpcErr } = await admin.rpc(
                "create_stock_movement_safe",
                {
                  p_product_id: productId,
                  p_qty_delta: -qty,
                  p_reason: "sale",
                  p_note: `order:${email}`,
                  p_actor_email: email,
                }
              );
              if (!rpcErr) moved = true;
            } catch {}

            // Fallback: direct decrement
            if (!moved) {
              const { data: prod } = await admin
                .from("products")
                .select("stock")
                .eq("id", productId)
                .maybeSingle();
              const current = Number(prod?.stock) || 0;
              const newStock = Math.max(0, current - qty);
              await admin
                .from("products")
                .update({ stock: newStock })
                .eq("id", productId);
            }
          }
        }
      } catch (err) {
        stockError = err.message;
        console.error("Stock reduction error:", err);
      }
    }

    // Create a simple email body
    const lines = [
      `New order from ${name || "Customer"}`,
      `Email: ${email}`,
      address ? `Address: ${address}` : null,
      "",
      "Items:",
      ...items.map(
        (it) =>
          `- ${it.title || it.flowerType || "Item"} x${
            it.quantity || 1
          } - PHP ${it.price}`
      ),
      "",
      `Total: PHP ${total}`,
    ].filter(Boolean);

    const html = `<pre>${lines.join("\n")}</pre>`;

    // Transport: use SMTP creds from env if available; otherwise use Ethereal dev account
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);

    let transporter;
    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // Fallback to Ethereal for testing (not for production)
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: test,
      });
    }

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `Daffodil Shop <no-reply@daffodilflower.page>`,
      to: email,
      subject: "Order Confirmation - Daffodil Flower Shop",
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    return new Response(
      JSON.stringify({
        ok: true,
        previewUrl,
        stockReduced: !stockError,
        stockError: stockError || null,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
