
-- CMS Professional Migration
-- Add missing fields for all content types

-- Add i18n, media, and other missing fields to games
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS genre_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS platform_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS status_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS description_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS image_gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS video_gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS platform_links JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add i18n and missing fields to news_posts
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS category_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS excerpt_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS body_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add i18n and media to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS body_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add i18n and media to developer_posts
ALTER TABLE public.developer_posts ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.developer_posts ADD COLUMN IF NOT EXISTS body_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.developer_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add i18n and missing fields to jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS team_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create site_settings table (if not exists)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT,
  value_tr TEXT,
  value_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Allow admins manage site settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Add RLS policies consistency check
-- (Re-declare policies to make sure they exist, idempotent)
DROP POLICY IF EXISTS "Public reads published games" ON public.games;
DROP POLICY IF EXISTS "Admins manage games" ON public.games;
DROP POLICY IF EXISTS "Public reads published news" ON public.news_posts;
DROP POLICY IF EXISTS "Admins manage news" ON public.news_posts;
DROP POLICY IF EXISTS "Public reads published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public reads published developer posts" ON public.developer_posts;
DROP POLICY IF EXISTS "Admins manage developer posts" ON public.developer_posts;
DROP POLICY IF EXISTS "Public reads published jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins manage jobs" ON public.jobs;

CREATE POLICY "Public reads published games" ON public.games FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admins manage games" ON public.games FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public reads published news" ON public.news_posts FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admins manage news" ON public.news_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public reads published announcements" ON public.announcements FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public reads published developer posts" ON public.developer_posts FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admins manage developer posts" ON public.developer_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public reads published jobs" ON public.jobs FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Update triggers for updated_at if needed
-- But we'll skip for now to keep migration simple
