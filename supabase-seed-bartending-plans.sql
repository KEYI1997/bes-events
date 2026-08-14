-- 境曜行動酒吧 2026 方案。
-- 可重複執行；以 slug 更新既有方案，不會產生重複產品。

WITH plan_data (
  plan_code, cups, suggested_people, original_price,
  sale_price, extra_cup_price, sort_order
) AS (
  VALUES
    ('A',  50,  '15 人以下', 'NT$13,500',  'NT$13,000', 'NT$260／杯', 1),
    ('B',  80,  '30 人以下', 'NT$21,000',  'NT$20,000', 'NT$250／杯', 2),
    ('C', 100,  '45 人以下', 'NT$26,000',  'NT$24,000', 'NT$240／杯', 3),
    ('D', 150,  '65 人以下', 'NT$38,500',  'NT$35,000', 'NT$230／杯', 4),
    ('E', 200,  '80 人以下', 'NT$51,000',  'NT$46,000', 'NT$220／杯', 5),
    ('F', 300, '150 人以下', 'NT$76,000',  'NT$67,000', 'NT$200／杯', 6),
    ('G', 400, '200 人以下', 'NT$101,000', 'NT$88,000', 'NT$190／杯', 7)
)
INSERT INTO products (
  name, slug, category, description, image_url, price_note,
  visible, sort_order, stock
)
SELECT
  format('PLAN %s｜%s杯方案', plan_code, cups),
  format('bartending-plan-%s-%s', lower(plan_code), cups),
  '外派調酒',
  format($description$【服務內容】
方案杯數：%s 杯
建議人數：%s
原價：%s
優惠價：%s
現場加點估價：%s
專業調酒師現場服務
客製化酒單與飲品配置設計
專屬行動吧台、調酒器具與必要設備
精選酒水、副料與調酒配料
活動場地評估、吧台位置與動線建議

【注意事項】
未滿十八歲禁止飲酒，飲酒後請勿駕車
雙北地區免收車馬費
雙北以外地區另收往返車馬費，依距離與地區報價
延長現場服務時間每小時 NT$2,000
指定酒款或酒水升級可依需求另行報價
現場臨時加點依方案標示的每杯成本估價，實際以現場可供應的酒水與材料為準
將依活動規模、流程與現場狀況評估是否需要增加人力，如有需求將另行報價
優惠價為方案基礎報價，最終金額以酒單、場地與活動細節確認後的正式報價為準$description$,
    cups, suggested_people, original_price, sale_price, extra_cup_price
  ),
  '/images/services/bartending-plans-2026.jpg',
  format(E'優惠價 %s\n現場加點 %s', sale_price, extra_cup_price),
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
