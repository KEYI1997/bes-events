-- ============================================
-- 境曜有限公司（BES Events）Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 1. 產品/服務
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('啟動儀式', '燈光音響舞台', '外派調酒', 'Show Girl')),
  description TEXT,
  image_url TEXT,
  price_note TEXT,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 案例展示
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('記者會/發表會', '尾牙春酒', '企業家庭日', '典禮節慶', '市集', '展覽')),
  description TEXT,
  image_url TEXT NOT NULL,
  client_name TEXT,
  event_date DATE,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Show Girl
CREATE TABLE showgirls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  height TEXT,
  measurements TEXT,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 合作客戶
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 客戶評價
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  rating INT DEFAULT 5,
  author TEXT,
  company TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 聯絡表單
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT,
  description TEXT,
  budget TEXT,
  event_date TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 常見問題
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 網站內容（Key-Value）
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS 政策
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE showgirls ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 前台讀取（僅 visible = true）
CREATE POLICY "Public read visible products" ON products FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible cases" ON cases FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible showgirls" ON showgirls FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible clients" ON clients FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible reviews" ON reviews FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible faqs" ON faqs FOR SELECT USING (visible = true);
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);

-- 表單：任何人可 INSERT
CREATE POLICY "Public insert contacts" ON contacts FOR INSERT WITH CHECK (true);

-- ============================================
-- 初始資料
-- ============================================

INSERT INTO site_content (key, value) VALUES
  ('hero_title', '活動，不只是辦，是打造影響力'),
  ('hero_subtitle', '境曜有限公司（Bright Events Services），專注於各類型活動整合與現場執行'),
  ('company_phone', '0912-727-596'),
  ('company_email', 'Jingyaoactivities@gmail.com'),
  ('company_line', '@648ubibg'),
  ('notification_email', 'Jingyaoactivities@gmail.com');

-- ============================================
-- Storage Bucket（需在 Supabase Dashboard 建立）
-- Bucket 名稱：images
-- 設定：Public bucket（允許公開讀取）
-- ============================================
