export const runtime = "nodejs";
import nodemailer from "nodemailer";

// Simple in-memory rate limit (per instance)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max requests per window per IP
const ipToHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipToHits.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  ipToHits.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const ipHeader = request.headers.get("x-forwarded-for") || "";
    const ip = ipHeader.split(",")[0].trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Try again later." }),
        { status: 429 }
      );
    }

    const { name, email, message, subject } = await request.json();
    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim();
    const trimmedSubject = String(subject || "").trim();
    const trimmedMessage = String(message || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }
    if (!isValidEmail(trimmedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
      });
    }
    if (trimmedMessage.length < 10) {
      return new Response(
        JSON.stringify({ error: "Message must be at least 10 characters" }),
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 587);
    const gmailClientId = process.env.GMAIL_CLIENT_ID;
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const gmailUser = process.env.GMAIL_USER;

    const transportPref = String(
      process.env.EMAIL_TRANSPORT || ""
    ).toLowerCase();
    const canUseSmtp = Boolean(host && user && pass);
    const canUseGmail = Boolean(
      gmailClientId && gmailClientSecret && gmailRefreshToken && gmailUser
    );

    let transporter;
    if (transportPref === "smtp" && canUseSmtp) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else if (transportPref === "gmail" && canUseGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: gmailUser,
          clientId: gmailClientId,
          clientSecret: gmailClientSecret,
          refreshToken: gmailRefreshToken,
        },
      });
    } else if (canUseSmtp) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else if (canUseGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: gmailUser,
          clientId: gmailClientId,
          clientSecret: gmailClientSecret,
          refreshToken: gmailRefreshToken,
        },
      });
    } else {
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: test,
      });
    }

    const safeSubject = (trimmedSubject || "General Inquiry").replace(
      /</g,
      "&lt;"
    );
    const safeMessage = String(trimmedMessage)
      .replace(/</g, "&lt;")
      .replace(/\n/g, "<br/>");
    const html = `
      <h3>New Contact Message</h3>
      <p><strong>From:</strong> ${trimmedName} &lt;${trimmedEmail}&gt;</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p>${safeMessage}</p>
    `;
    const text = `New Contact Message\nFrom: ${trimmedName} <${trimmedEmail}>\nSubject: ${safeSubject}\n\n${trimmedMessage}`;
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        gmailUser ||
        `Daffodil Contact <no-reply@daffodilflower.page>`,
      to: process.env.CONTACT_TO || trimmedEmail,
      replyTo: trimmedEmail,
      subject: `Contact: ${safeSubject} — ${trimmedName}`,
      html,
      text,
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
