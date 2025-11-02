# Content Management System (CMS) Setup Guide

This guide will help you set up the CMS for managing static pages, promotions, banners, and homepage content.

## Database Setup

First, you need to create the CMS tables in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `database-schema-cms.sql`
4. Copy all the SQL content
5. Paste it into the Supabase SQL Editor
6. Click "Run" to execute the SQL

This will create the following tables:

- `cms_pages` - Static pages (About, Contact, FAQs, Privacy Policy)
- `cms_promotions` - Promotions, banners, and advertisements
- `cms_homepage_sections` - Homepage content sections

## Initial Data

The SQL file includes initial data for:

- Four default static pages (About Us, Contact, FAQs, Privacy Policy)
- Sample homepage sections

You can customize or delete these as needed after running the SQL.

## Admin Access

To access the CMS:

1. Log in as an admin user
2. Go to `/admin`
3. Click on "CMS" in the Quick Actions
4. You'll see three sections:
   - **Pages**: Manage static pages
   - **Promotions**: Manage banners and promotions
   - Each section has its own management interface

## Features

### Static Pages

- Create, edit, and delete static pages
- Set status (published/draft)
- Add SEO meta tags
- Each page has a unique slug (URL path)
- Pages are accessible at `/{slug}`

### Promotions/Banners

- Create visual promotions with images
- Set display positions (homepage hero, banner, sidebar)
- Configure start/end dates
- Set priority (higher priority displays first)
- Toggle active/inactive status

### Homepage Sections

- Manage content for different homepage sections
- Supports text, HTML, and JSON content types
- Control display order
- Toggle visibility

## API Endpoints

### Admin Endpoints (Protected)

- `GET /api/admin/cms/pages` - List all pages
- `POST /api/admin/cms/pages` - Create new page
- `GET /api/admin/cms/pages/[id]` - Get specific page
- `PUT /api/admin/cms/pages/[id]` - Update page
- `DELETE /api/admin/cms/pages/[id]` - Delete page
- Similar endpoints for promotions

### Public Endpoints

- `GET /api/cms/pages/[slug]` - Get published page by slug
- `GET /api/cms/promotions?position=homepage-hero` - Get active promotions

## Security

All admin endpoints are protected by admin authentication checks.
Public endpoints only return published/active content.
Row Level Security (RLS) policies are configured in the database schema.

## Next Steps

After setup:

1. Run the database schema SQL in Supabase
2. Access the CMS through the admin panel
3. Customize the default pages
4. Add your own promotions and banners
5. Configure homepage sections to match your needs

## Troubleshooting

**Can't access CMS?**

- Make sure you're logged in as an admin
- Check that `users.is_admin = true` for your account

**Database errors?**

- Verify that you've run the `database-schema-cms.sql` file
- Check that all tables were created successfully
- Ensure RLS policies are enabled

**Pages not showing publicly?**

- Make sure pages are set to "published" status
- Check that the slug is correctly formatted
- Verify public API endpoints are working
