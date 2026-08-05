-- Migration: cases 資料表新增 service_type、sort_order 欄位
-- 在 Supabase Dashboard > SQL Editor 執行

-- 1. 新增 service_type 欄位（服務項目）
ALTER TABLE cases ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT '';

-- 2. 新增 sort_order 欄位（排序，數字越小越前面）
ALTER TABLE cases ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 3. 將現有案例的 sort_order 依建立時間初始化
UPDATE cases
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM cases
) sub
WHERE cases.id = sub.id;
