-- 擴充產品服務大項，供諮詢轉單表單依服務類型篩選方案。
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl'));
