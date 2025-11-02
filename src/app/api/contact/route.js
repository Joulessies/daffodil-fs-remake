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
        requireTLS: port === 587, // Brevo uses TLS on port 587
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
        requireTLS: port === 587, // Brevo uses TLS on port 587
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

    const safeName = String(trimmedName)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeSubject = (trimmedSubject || "General Inquiry")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeMessage = String(trimmedMessage)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    // Determine recipient email (should go to business, not back to sender)
    const contactEmail =
      process.env.CONTACT_TO ||
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
      "support@daffodilflower.page";

    // Determine sender email
    const fromEmail =
      process.env.EMAIL_FROM ||
      gmailUser ||
      `Daffodil Contact <no-reply@daffodilflower.page>`;

    // Email to business/support team
    const businessHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #bc0930; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin: 15px 0; }
            .field-label { font-weight: bold; color: #555; }
            .message-box { background-color: white; padding: 15px; border-left: 4px solid #bc0930; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="field-label">From:</span> ${safeName} &lt;${trimmedEmail}&gt;
              </div>
              <div class="field">
                <span class="field-label">Subject:</span> ${safeSubject}
              </div>
              <div class="message-box">
                <div class="field-label">Message:</div>
                <div style="margin-top: 10px;">${safeMessage}</div>
              </div>
              <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                You can reply directly to this email to respond to ${safeName}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const businessText = `New Contact Form Submission\n\nFrom: ${trimmedName} <${trimmedEmail}>\nSubject: ${safeSubject}\n\nMessage:\n${trimmedMessage}`;

    // Send email to business
    const businessEmail = await transporter.sendMail({
      from: fromEmail,
      to: contactEmail,
      replyTo: trimmedEmail,
      subject: `Contact Form: ${safeSubject} — ${trimmedName}`,
      html: businessHtml,
      text: businessText,
    });

    // Auto-reply confirmation email to user
    const userHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #bc0930; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .message { background-color: white; padding: 15px; border-left: 4px solid #bc0930; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Thank You for Contacting Us!</h2>
            </div>
            <div class="content">
              <p>Hi ${safeName},</p>
              <p>We've received your message and we'll get back to you as soon as possible. We typically respond within 24 hours.</p>
              <div class="message">
                <p style="margin: 0; font-weight: bold;">Your Message:</p>
                <p style="margin-top: 10px;">${safeMessage}</p>
              </div>
              <p>If you have any urgent inquiries, please feel free to call us or visit our location.</p>
              <div class="footer">
                <p style="margin: 5px 0;"><strong>Best regards,</strong></p>
                <p style="margin: 5px 0;">The Daffodil Flower Shop Team</p>
                <p style="margin: 10px 0 0 0; font-size: 0.85em;">
                  TIP QC, Aurora Blvd, Cubao, Quezon City, Philippines<br/>
                  Mon–Fri: 9:00 AM – 6:00 PM | Sat: 10:00 AM – 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const userText = `Thank You for Contacting Us!\n\nHi ${trimmedName},\n\nWe've received your message and we'll get back to you as soon as possible. We typically respond within 24 hours.\n\nYour Message:\n${trimmedMessage}\n\nIf you have any urgent inquiries, please feel free to call us or visit our location.\n\nBest regards,\nThe Daffodil Flower Shop Team`;

    // Send auto-reply to user
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: trimmedEmail,
        subject: `Thank you for contacting Daffodil - Re: ${safeSubject}`,
        html: userHtml,
        text: userText,
      });
    } catch (autoReplyError) {
      // Log error but don't fail the main request if auto-reply fails
      console.error("Failed to send auto-reply:", autoReplyError);
    }

    const previewUrl = nodemailer.getTestMessageUrl?.(businessEmail);
    return new Response(JSON.stringify({ ok: true, previewUrl }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
