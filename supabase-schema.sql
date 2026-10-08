-- ============================================
-- 境曜有限公司（BES Events）Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 1. 產品/服務
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl')),
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
  -- Facebook / 文章發佈日期
  event_date DATE,
  -- 實際活動當日日期；由後臺手動填寫
  activity_date DATE,
  used_services TEXT[] NOT NULL DEFAULT '{}',
  used_products TEXT[] NOT NULL DEFAULT '{}',
  applicable_occasions TEXT[] NOT NULL DEFAULT '{}',
  venue_area TEXT,
  venue_type TEXT,
  guest_count TEXT,
  project_goal TEXT,
  project_challenge TEXT,
  solution TEXT,
  outcome TEXT,
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
  event_location TEXT,
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

-- 9. 公開案例媒體投影（由 site_content 的 facebook_case_detail_* 安全複製而來）
-- 舊 site_content 會保留作為遷移備援；此表只放前台需要的媒體欄位。
CREATE TABLE public_case_media (
  case_id UUID PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  source_url TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  image_captions TEXT[] NOT NULL DEFAULT '{}',
  video_urls TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. 前台允許公開的少量網站設定；其他 site_content 一律只由後端讀取。
CREATE TABLE public_site_content (
  key TEXT PRIMARY KEY,
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
ALTER TABLE public_case_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_site_content ENABLE ROW LEVEL SECURITY;

-- 前台讀取（僅 visible = true）
CREATE POLICY "Public read visible products" ON products FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible cases" ON cases FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible showgirls" ON showgirls FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible clients" ON clients FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible reviews" ON reviews FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible faqs" ON faqs FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible case media" ON public_case_media
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = public_case_media.case_id
      AND cases.visible = true
  ));
CREATE POLICY "Public read allowed site content" ON public_site_content FOR SELECT USING (true);

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
  ('company_line', '@040kolkv'),
  ('notification_email', 'Jingyaoactivities@gmail.com'),
  ('admin_line_phone', '["0911247541"]');

INSERT INTO public_site_content (key, value)
SELECT key, value FROM site_content
WHERE key IN ('hero_title', 'hero_subtitle', 'company_phone', 'company_email', 'company_line')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ============================================
-- Storage Bucket（需在 Supabase Dashboard 建立）
-- Bucket 名稱：images
-- 設定：Public bucket（允許公開讀取）
-- ============================================
