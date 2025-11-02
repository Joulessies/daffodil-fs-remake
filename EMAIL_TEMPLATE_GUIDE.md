# Email Template Editing Guide

This guide shows you how to customize the Contact Us email templates.

## File Location

All email templates are in: `src/app/api/contact/route.js`

## Two Email Types

### 1. Business Email (to Support Team)

**Location:** Lines 148-198

This email is sent to your support team when someone submits the contact form.

**What you can edit:**

- **Header title** (line 166): "New Contact Form Submission"
- **Colors** (line 156): `#bc0930` is your brand red color
- **Font** (line 154): `Arial, sans-serif`
- **Footer message** (line 180): "You can reply directly..."

**Subject line** (line 195): `Contact Form: ${safeSubject} — ${trimmedName}`

---

### 2. User Auto-Reply Email (to Customer)

**Location:** Lines 201-256

This is the confirmation email sent to customers after they submit the form.

**What you can edit:**

#### Header Title (line 218)

```html
<h2 style="margin: 0;">Thank You for Contacting Us!</h2>
```

#### Greeting & Message (lines 221-227)

```html
<p>Hi ${safeName},</p>
<p>
  We've received your message and we'll get back to you as soon as possible. We
  typically respond within 24 hours.
</p>
```

#### Footer - Company Info (lines 228-235)

```html
<p style="margin: 5px 0;"><strong>Best regards,</strong></p>
<p style="margin: 5px 0;">The Daffodil Flower Shop Team</p>
<p style="margin: 10px 0 0 0; font-size: 0.85em;">
  TIP QC, Aurora Blvd, Cubao, Quezon City, Philippines<br />
  Mon–Fri: 9:00 AM – 6:00 PM | Sat: 10:00 AM – 4:00 PM
</p>
```

#### Subject Line (line 249)

```javascript
subject: `Thank you for contacting Daffodil - Re: ${safeSubject}`,
```

#### Plain Text Version (line 242)

Edit the `userText` variable for email clients that don't support HTML.

---

## Quick Customization Examples

### Change Response Time

**Line 222:** Change "We typically respond within 24 hours" to your actual timeframe.

### Change Company Name

**Line 230:** Change "The Daffodil Flower Shop Team" to your team name.

### Update Business Hours/Location

**Lines 232-234:** Update address and hours as needed.

### Change Colors

**Line 156 & 209:** Change `#bc0930` to your brand color
**Line 160 & 211:** Change the border color to match

### Change Fonts

**Line 154 & 207:** Change `Arial, sans-serif` to your preferred font, e.g.:

- `'Georgia', serif`
- `'Times New Roman', serif`
- `'Helvetica Neue', Arial, sans-serif`

### Change Email Subject

**Line 195 (Business):** `Contact Form: ${safeSubject} — ${trimmedName}`
**Line 249 (User):** `Thank you for contacting Daffodil - Re: ${safeSubject}`

---

## Variables Available

These variables are automatically inserted:

- `${safeName}` - Customer's name (sanitized)
- `${trimmedEmail}` - Customer's email
- `${safeSubject}` - Message subject
- `${safeMessage}` - Customer's message (HTML formatted)
- `${trimmedName}` - Customer's name (for text version)

---

## Important Notes

1. **HTML escaping is automatic** - Don't worry about XSS attacks, variables are sanitized
2. **CSS in `<style>` tags** - Styles are in the `<head>` section
3. **Inline styles also work** - You can add `style="..."` attributes
4. **Test after changes** - Always test emails after editing
5. **Both HTML and text** - Always update both `businessHtml`/`userHtml` AND `businessText`/`userText`

---

## Testing

After making changes:

1. Restart your Next.js server
2. Submit a test contact form
3. Check both email inboxes
4. Verify formatting looks good on mobile and desktop
