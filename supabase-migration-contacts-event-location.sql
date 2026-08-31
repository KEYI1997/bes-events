-- ============================================
-- 聯絡諮詢活動地點 Migration
-- 已於 Supabase Dashboard > SQL Editor 執行
-- ============================================

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS event_location TEXT;

-- 將先前暫存於需求說明第一行的活動地點回填為正式欄位。
UPDATE public.contacts
SET event_location = BTRIM((regexp_match(description, '(^|[\n\r])活動地點：([^\n\r]+)'))[2])
WHERE event_location IS NULL
  AND description ~ '(^|[\n\r])活動地點：';
