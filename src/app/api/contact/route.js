export const runtime = "nodejs";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

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
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: test,
      });
    }

    const html = `
      <h3>New Contact Message</h3>
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p>${message.replace(/</g, "&lt;")}</p>
    `;
    const info = await transporter.sendMail({
      from: `Daffodil Contact <no-reply@daffodilflower.page>`,
      to: process.env.CONTACT_TO || email,
      subject: `Contact form message from ${name}`,
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
