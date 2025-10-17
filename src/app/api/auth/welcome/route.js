export const runtime = "nodejs";
import nodemailer from "nodemailer";

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const gmailUser = process.env.GMAIL_USER;

  const pref = String(process.env.EMAIL_TRANSPORT || "").toLowerCase();
  const canSmtp = Boolean(host && user && pass);
  const canGmail = Boolean(
    gmailClientId && gmailClientSecret && gmailRefreshToken && gmailUser
  );

  if (pref === "smtp" && canSmtp) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  if (pref === "gmail" && canGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
      },
    });
  }
  if (canSmtp) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  if (canGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
      },
    });
  }

  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: test,
  });
}

export async function POST(request) {
  try {
    const { email, name } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
      });
    }

    const transporter = await createTransport();

    const safeName = String(name || "").replace(/</g, "&lt;");
    const html = `
      <h2>Welcome to Daffodil!</h2>
      <p>Hi ${safeName || "there"},</p>
      <p>Thanks for creating an account with Google. We're excited to have you!</p>
      <p>You can now browse our catalog and place orders with ease.</p>
      <p style="margin-top:16px">— The Daffodil Team</p>
    `;

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.GMAIL_USER ||
        `Daffodil <no-reply@daffodilflower.page>`,
      to: email,
      subject: "Welcome to Daffodil",
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
