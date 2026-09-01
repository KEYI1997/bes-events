-- Migration: 新增案例「活動當日日期」欄位
-- 在 Supabase Dashboard > SQL Editor 執行一次；可安全重複執行。

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS activity_date DATE;

COMMENT ON COLUMN cases.activity_date IS '實際活動當日日期；由管理者於案例後臺手動填寫，不從 Facebook 貼文自動帶入';
