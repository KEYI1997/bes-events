-- ============================================
-- 產品表結構調整 Migration v2
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 移除 slug 欄位（及其 UNIQUE 約束）
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_key;
ALTER TABLE products DROP COLUMN IF EXISTS slug;

-- 移除舊的 description 和 image_url 欄位
ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE products DROP COLUMN IF EXISTS image_url;
ALTER TABLE products DROP COLUMN IF EXISTS size_image_url;

-- 新增欄位
ALTER TABLE products ADD COLUMN IF NOT EXISTS service_content TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS notice TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_image_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT '';
