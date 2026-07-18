-- Add new columns for improved CMS
ALTER TABLE games 
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS trailer_url TEXT,
  ADD COLUMN IF NOT EXISTS platform_links JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_gallery TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_gallery TEXT[] DEFAULT '{}';

-- Add i18n columns if not already there
ALTER TABLE games 
  ADD COLUMN IF NOT EXISTS title_i18n JSONB,
  ADD COLUMN IF NOT EXISTS genre_i18n JSONB,
  ADD COLUMN IF NOT EXISTS status_i18n JSONB,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB;

-- Update news_posts too
ALTER TABLE news_posts 
  ADD COLUMN IF NOT EXISTS title_i18n JSONB,
  ADD COLUMN IF NOT EXISTS category_i18n JSONB,
  ADD COLUMN IF NOT EXISTS excerpt_i18n JSONB,
  ADD COLUMN IF NOT EXISTS body_i18n JSONB;

-- RLS for site_settings if not already
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  value_tr TEXT,
  value_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site_settings" ON site_settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update site_settings" ON site_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete site_settings" ON site_settings FOR DELETE USING (public.is_admin());
