-- 非破壞性遷移：新增前台案例媒體投影。
-- 執行前不刪除 site_content，也不移動 images/ai-files Storage 物件。
CREATE TABLE IF NOT EXISTS public_case_media (
  case_id UUID PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  source_url TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  video_urls TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public_case_media DROP COLUMN IF EXISTS facebook_video_ids;

CREATE INDEX IF NOT EXISTS public_case_media_updated_at_idx
  ON public_case_media (updated_at DESC);

ALTER TABLE public_case_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible case media" ON public_case_media;
CREATE POLICY "Public read visible case media" ON public_case_media
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = public_case_media.case_id
      AND cases.visible = true
  ));

CREATE TABLE IF NOT EXISTS public_site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public_site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read allowed site content" ON public_site_content;
CREATE POLICY "Public read allowed site content" ON public_site_content FOR SELECT USING (true);

INSERT INTO public_site_content (key, value)
SELECT key, value FROM site_content
WHERE key IN ('hero_title', 'hero_subtitle', 'company_phone', 'company_email', 'company_line')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
