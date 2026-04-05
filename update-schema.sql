-- Run these queries in your Supabase SQL Editor to support English names
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS name_en text;
-- If you have a specific teachers table:
-- ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS name_en text;
