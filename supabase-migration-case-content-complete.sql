-- 案例內容完整化與圖片說明欄位
-- 可安全重複執行；請在 Supabase SQL Editor 執行一次。

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS venue_area TEXT,
  ADD COLUMN IF NOT EXISTS venue_type TEXT,
  ADD COLUMN IF NOT EXISTS guest_count TEXT,
  ADD COLUMN IF NOT EXISTS project_goal TEXT,
  ADD COLUMN IF NOT EXISTS project_challenge TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT;

ALTER TABLE public_case_media
  ADD COLUMN IF NOT EXISTS image_captions TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN cases.venue_area IS '活動城市或地區，例如台北市';
COMMENT ON COLUMN cases.venue_type IS '場地類型，例如飯店宴會廳、展覽館';
COMMENT ON COLUMN cases.guest_count IS '活動規模的公開文字，例如約 200 人';
COMMENT ON COLUMN cases.project_goal IS '活動目標；前台案例頁顯示';
COMMENT ON COLUMN cases.project_challenge IS '現場挑戰；前台案例頁顯示';
COMMENT ON COLUMN cases.solution IS '規劃與執行方式；前台案例頁顯示';
COMMENT ON COLUMN cases.outcome IS '活動成果；前台案例頁顯示';
COMMENT ON COLUMN public_case_media.image_captions IS '與 image_urls 同順序的圖片說明／替代文字';
