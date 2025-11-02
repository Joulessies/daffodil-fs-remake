-- Add image_url column to cms_pages table
ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN cms_pages.image_url IS 'URL path to the featured image for the page';

-- Add philosophy_data column to store philosophy section as JSON
ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS philosophy_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN cms_pages.philosophy_data IS 'JSON data for philosophy section including title and cards';

-- Add team_data column to store team section as JSON
ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS team_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN cms_pages.team_data IS 'JSON data for the Meet Our Team section including title, subtitle, and an array of team members.';

-- Add testimonials_data column to store testimonials section as JSON
ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS testimonials_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN cms_pages.testimonials_data IS 'JSON data for testimonials section including title and array of testimonials';

-- Add values_data column to store values section as JSON
ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS values_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN cms_pages.values_data IS 'JSON data for values section including title and array of value items';

