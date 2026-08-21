-- ============================================
-- 訂單報價單狀態 & 已結案狀態 Migration
-- 適用於已存在 orders 表的環境
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quotation_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quotation_sent_at TIMESTAMPTZ;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quotation_email_sent_at TIMESTAMPTZ;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quotation_line_sent_at TIMESTAMPTZ;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quotation_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS orders_quotation_token_key
  ON orders (quotation_token);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('已預約', '出借中', '已歸還', '已結案', '已取消'));
