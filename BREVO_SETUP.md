# Brevo (Sendinblue) Email Configuration

## Brevo SMTP Settings

To configure your Contact Us email system with Brevo, add these environment variables to your `.env.local` file:

```env
# Brevo SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@example.com
SMTP_PASS=your-brevo-smtp-key

# Optional: Prefer SMTP transport
EMAIL_TRANSPORT=smtp

# Contact email configuration
CONTACT_TO=support@daffodilflower.page
EMAIL_FROM=Daffodil Flower Shop <noreply@daffodilflower.page>
```

## How to Get Your Brevo Credentials

1. **Sign up or log in** to [Brevo](https://www.brevo.com)

2. **Navigate to SMTP & API**:

   - Go to **Settings** → **SMTP & API**
   - Or visit: https://app.brevo.com/settings/keys/api

3. **Get your SMTP Key**:

   - Click on **SMTP** tab
   - Copy your **SMTP Key** (this is your password)
   - Your SMTP login is your Brevo account email address

4. **Verify your sender email**:
   - Go to **Senders & IP** → **Senders**
   - Add and verify the email address you want to use as the "From" address
   - This is important - Brevo will only send from verified addresses

## Important Notes

- **SMTP Host**: `smtp-relay.brevo.com`
- **Port**: `587` (TLS) or `465` (SSL) - 587 is recommended
- **Username**: Your Brevo account email address
- **Password**: Your SMTP Key (NOT your Brevo account password)
- **Free Tier**: 300 emails/day, perfect for contact forms!

## Testing

After configuration:

1. Restart your Next.js development server
2. Submit a test message through the Contact Us form
3. Check both:
   - Your support email inbox (should receive the contact form submission)
   - The sender's email (should receive auto-reply confirmation)

## Troubleshooting

If emails aren't sending:

- Verify your sender email in Brevo dashboard
- Check that your SMTP Key is correct (not your account password)
- Ensure `SMTP_PORT` is set to `587` for TLS
- Check Brevo dashboard for any delivery errors
- Make sure your domain is verified if using a custom domain
