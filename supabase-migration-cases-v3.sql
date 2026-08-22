-- Migration: Facebook 案例同步的結構化資料欄位
-- 請在 Supabase Dashboard > SQL Editor 執行一次

ALTER TABLE cases ADD COLUMN IF NOT EXISTS used_services TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS used_products TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS applicable_occasions TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN cases.used_services IS '此活動實際使用的服務，可複數';
COMMENT ON COLUMN cases.used_products IS '此活動實際使用的道具或產品，可複數';
COMMENT ON COLUMN cases.applicable_occasions IS '服務及商品適用的活動場合，可複數';
