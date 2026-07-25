-- ============================================
-- 庫存管理 & 訂單管理 Migration
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 1. 為 products 表新增 stock 欄位（庫存數量）
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 1;

-- 2. 建立 orders（訂單/出借紀錄）表
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  quantity INT NOT NULL DEFAULT 1,
  borrow_date DATE NOT NULL,
  return_date DATE NOT NULL,
  event_name TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT '已預約' CHECK (status IN ('已預約', '出借中', '已歸還', '已取消')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS 政策
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 後台可完整 CRUD（透過 service_role key）
-- 前台不開放 orders 讀取
