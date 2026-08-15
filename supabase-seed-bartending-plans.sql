-- 外派調酒 2026 方案資料
-- 以 slug 作為穩定識別，可安全重複執行以更新方案內容。
WITH plan_data (
  plan_code, cups, suggested_people, original_price,
  sale_price, extra_cup_price, sort_order
) AS (
  VALUES
    ('A',  50,  '15 人以內',  'NT$13,500',  'NT$13,000', 'NT$260／杯', 1),
    ('B',  80,  '30 人以內',  'NT$21,000',  'NT$20,000', 'NT$250／杯', 2),
    ('C', 100,  '45 人以內',  'NT$26,000',  'NT$24,000', 'NT$240／杯', 3),
    ('D', 150,  '65 人以內',  'NT$38,500',  'NT$35,000', 'NT$230／杯', 4),
    ('E', 200,  '80 人以內',  'NT$51,000',  'NT$46,000', 'NT$220／杯', 5),
    ('F', 300, '150 人以內',  'NT$76,000',  'NT$67,000', 'NT$200／杯', 6),
    ('G', 400, '200 人以內', 'NT$101,000',  'NT$88,000', 'NT$190／杯', 7)
)
INSERT INTO products (
  name, slug, category, description, image_url, price_note,
  visible, sort_order, stock
)
SELECT
  format('PLAN %s｜%s 杯方案', plan_code, cups),
  format('bartending-plan-%s-%s', lower(plan_code), cups),
  '外派調酒',
  format($description$【服務內容】
方案杯數：%s 杯
建議人數：%s
原價：%s
優惠價：%s
現場加點估價：%s
專業調酒師現場服務與客製酒單設計
行動吧台設備與基本器材
精選酒款、調酒材料與耗材
活動場地與流程配置建議

【注意事項】
未滿十八歲禁止飲酒，酒後不開車
臺北市、新北市免車馬費；其他地區依距離另計往返車馬費
延長服務每小時 NT$2,000
指定酒款或升級酒款另行報價
現場追加杯數依各方案標示估價
活動規模較大時，額外人力另行報價
最終報價依活動日期、地點、時數與需求確認為準$description$,
    cups, suggested_people, original_price, sale_price, extra_cup_price
  ),
  '/images/services/bartending-plans-2026.jpg',
  format(E'優惠價：%s\n現場加點：%s', sale_price, extra_cup_price),
  true,
  sort_order,
  1
FROM plan_data
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price_note = EXCLUDED.price_note,
  visible = EXCLUDED.visible,
  sort_order = EXCLUDED.sort_order,
  stock = EXCLUDED.stock;
