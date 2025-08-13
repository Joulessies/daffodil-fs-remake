export const runtime = "nodejs";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, name, address, items, total } = await request.json();

    // Basic validation
    if (!email || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing email or items" }), {
        status: 400,
      });
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
      from: `Daffodil Shop <no-reply@daffodilflower.page>`,
      to: email,
      subject: "Order Confirmation - Daffodil Flower Shop",
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    return new Response(JSON.stringify({ ok: true, previewUrl }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
