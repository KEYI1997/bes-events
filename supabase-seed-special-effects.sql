-- 活動特效產品：分類限制與 Excel 素材種子資料。
-- 可重複執行；以 slug 更新既有資料，不會產生重複產品。

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl'));

INSERT INTO products (
  name, slug, category, description, image_url, price_note,
  visible, sort_order, stock
)
VALUES
(
  '煙霧泡泡機',
  'special-effect-smoke-bubble',
  '活動特效',
  $description$【效果介紹】
煙霧泡泡機結合泡泡與煙霧效果，將煙霧包覆於泡泡之中，形成大量白色煙霧泡泡飄散於活動現場。泡泡破裂時會釋放煙霧，帶來夢幻且具有層次感的視覺效果，特別適合婚禮、舞台演出、親子活動及各類氣氛營造。

【效果特色】
* 結合煙霧與泡泡效果，打造夢幻且具有層次的視覺呈現
* 泡泡破裂後釋放白色煙霧，增加現場趣味及互動效果
* 提供兩頭、四頭設備選擇，可依場地大小及效果需求配置
* 可搭配燈光、舞台效果使用，提升泡泡與煙霧的視覺層次

【注意事項】
* 電力需求：110V／10A
* 操作人員：建議由專業人員操作
* 使用空間：建議保留足夠泡泡飄散空間
* 場地限制：室內／室外皆可，效果會受風向、空調及現場環境影響
* 耗材需求：需搭配專用泡泡液及煙霧耗材
* 施作時間：建議活動前 1 小時完成設備定位及效果測試
* 清潔需求：泡泡液可能造成地面濕滑，活動後需視現場狀況清潔

【適用場合】
* 婚禮進場
* 啟動儀式
* 開幕典禮
* 親子活動
* 演唱會
* 舞台演出
* 品牌發表會
* 尾牙春酒
* 展覽活動
* 商業活動$description$,
  '/images/products/special-effects/smoke-bubble/smoke-bubble-1.jpg,/images/products/special-effects/smoke-bubble/smoke-bubble-2.jpg',
  '四頭 NT$12,000／兩頭 NT$5,000／控施費 NT$3,500',
  true, 1, 1
),
(
  '彩帶加農砲',
  'special-effect-confetti-cannon',
  '活動特效',
  $description$【效果介紹】
彩帶加農砲可瞬間將大量彩帶強力噴射至空中，形成大範圍飄落效果，快速營造熱鬧、歡慶且具有爆發力的活動畫面。適合運用於開幕、啟動、頒獎、倒數及各類活動高潮時刻，讓現場氣氛瞬間拉滿。

【效果特色】
* 瞬間大量噴射彩帶，打造強烈的視覺爆發效果
* 彩帶於空中大範圍飄落，適合大型活動及舞台使用
* 可依活動主題搭配不同顏色彩帶
* 可搭配倒數、音樂、燈光及其他舞台特效同步施放

【注意事項】
* 一次性道具無法彩排
* 電力需求：110V／5A
* 操作人員：建議由專業人員操作
* 砲口前方須保持安全距離，不可直接朝向人員或設備
* 室內／室外皆可，實際效果依場地高度、風向及環境而定
* 需搭配專用彩帶耗材，活動後需進行彩帶回收及場地清潔
* 施放前須確認噴射方向無燈具、布幕或其他障礙物

【適用場合】
* 啟動儀式
* 開幕典禮
* 倒數儀式
* 頒獎典禮
* 演唱會
* 婚禮進場
* 尾牙春酒
* 畢業典禮
* 運動賽事
* 品牌活動$description$,
  '/images/products/special-effects/confetti-cannon/confetti-cannon-1.jpg,/images/products/special-effects/confetti-cannon/confetti-cannon-2.jpg',
  '兩組 NT$8,000（含控施費）',
  true, 2, 1
),
(
  '冷焰火／火花機',
  'special-effect-cold-spark',
  '活動特效',
  $description$【效果介紹】
冷焰火採用金屬粒子加熱技術，無需傳統火藥或易燃燃料，即可呈現高質感的火花噴泉效果。火花高度可依活動需求調整，適合搭配音樂、燈光及活動流程，打造具有節奏感與視覺張力的舞台效果。

【效果特色】
* 火花高度可依活動需求調整，打造震撼舞台效果
* 採用無火藥技術，低煙、低氣味，適合多種活動場域
* 支援 DMX 控制，可與燈光、音樂及活動流程同步演出
* 火花落地後快速冷卻，提升現場使用安全性

【注意事項】
* 電力需求：110V／15A（依設備規格）
* 需由專業人員操作，設備周圍須保持安全距離
* 建議保持足夠淨空高度，避免上方有燈具、布幕或障礙物
* 室內／室外皆可，須依場地消防、安全規範及環境評估
* 需使用專用冷焰火耗材
* 建議活動前 1 小時完成設備定位、測試及控制設定
* 請勿自行拆卸設備或使用非指定耗材

【適用場合】
* 啟動儀式
* 開幕典禮
* 倒數儀式
* 頒獎典禮
* 婚禮進場
* 演唱會
* 音樂祭
* 品牌發表會
* 尾牙春酒
* 商業演出$description$,
  '/images/products/special-effects/cold-spark/cold-spark-1.jpg,/images/products/special-effects/cold-spark/cold-spark-2.jpg,/images/products/special-effects/cold-spark/cold-spark-3.jpg,/images/products/special-effects/cold-spark/cold-spark-4.jpg',
  '依檔期報價／控施費 NT$3,500',
  true, 3, 1
),
(
  'LSG 低煙機／專業煙霧機',
  'special-effect-lsg-low-fog',
  '活動特效',
  $description$【效果介紹】
LSG 低煙機／專業煙霧機可快速營造細緻均勻的舞台霧氣，提供濃霧、薄霧及貼地低煙等多種效果，有效提升燈光層次與舞台氛圍。適合演唱會、舞台劇、品牌發表會、展覽及各類大型活動，打造更具質感與層次的視覺演出。

【效果特色】
* 輸出快速且霧量充足，短時間即可營造大範圍舞台霧效
* 支援濃霧、薄霧及貼地低煙等多種效果
* 霧氣細緻均勻、低氣味，適合長時間舞台演出使用
* 可搭配燈光、雷射等設備，強化光束層次與整體舞台效果

【注意事項】
* 電力需求：220V／15A（依設備規格）
* 需由專業人員現場操作，控機人員費用另計
* 需保留設備、管線及操作空間
* 室內／室外皆可，效果會受風向、空調、溫度及場地環境影響
* 需使用專用煙霧油／低煙耗材
* 建議活動前 1 小時完成定位、管線配置、測試及效果確認

【適用場合】
* 啟動儀式
* 開幕典禮
* 演唱會
* 舞台劇
* 品牌發表會
* 展覽活動
* 婚禮進場
* 尾牙春酒
* 電視錄影
* 商業演出$description$,
  '/images/products/special-effects/lsg-low-fog/lsg-low-fog-1.webp,/images/products/special-effects/lsg-low-fog/lsg-low-fog-2.jpg',
  'NT$30,000（含控施費）／專業操作人員另計',
  true, 4, 1
),
(
  'CO₂ 特效噴槍',
  'special-effect-co2-gun',
  '活動特效',
  $description$【效果介紹】
CO₂ 特效噴槍可瞬間噴射強烈的白色氣柱，營造震撼的爆發效果，迅速帶動現場氣氛。手持式設計可依表演節奏靈活控制噴射時機與方向，廣泛應用於演唱會、DJ 派對、夜店活動、舞台演出及品牌活動。

【效果特色】
* 瞬間噴射高密度白色氣柱，打造強烈視覺效果
* 手持式設計，可靈活控制噴發時機與方向
* 可配合音樂節奏、燈光及活動高潮進行噴射
* 搭配 CO₂ 高壓鋼瓶使用，適合室內及戶外活動

【注意事項】
* 無電力需求，使用 CO₂ 高壓鋼瓶
* 持續按壓約可使用 30 秒；間斷噴射約 20～30 次
* 須保留充足噴射空間，不可近距離正對人員或設備
* 密閉或通風不良空間須經現場評估後使用
* 建議活動前 30 分鐘完成設備連接及測試
* 噴射溫度較低，禁止近距離朝向人員臉部、皮膚或身體

【適用場合】
* 啟動儀式
* 開幕典禮
* 演唱會
* DJ 派對
* 夜店活動
* 音樂祭
* 品牌發表會
* 尾牙春酒
* 展覽活動
* 商業演出$description$,
  '/images/products/special-effects/co2-gun/co2-gun-1.jpg,/images/products/special-effects/co2-gun/co2-gun-2.jpg,/images/products/special-effects/co2-gun/co2-gun-3.jpg',
  'NT$8,000',
  true, 5, 1
),
(
  'CO₂ 氣柱特效',
  'special-effect-co2-jet',
  '活動特效',
  $description$【效果介紹】
CO₂ 氣柱特效利用高壓液態二氧化碳瞬間氣化，噴射出高聳白色氣柱，打造震撼且充滿爆發力的舞台效果。適合搭配音樂節奏、倒數時刻、開場演出及活動高潮使用，瞬間提升現場氣氛。

【效果特色】
* 可噴射約 5～8 公尺白色氣柱，視覺震撼、爆發力十足
* 氣柱集中俐落，瞬間形成具有張力的舞台畫面
* 噴射後快速消散，不易長時間累積霧氣
* 可依舞台配置多台搭配，配合音樂與燈光同步演出

【注意事項】
* 電力需求：110V／15A（依設備規格）
* 需由專業人員操作
* 建議保留至少 10 公尺以上淨空高度
* 觀眾及表演人員須與噴射口保持適當安全距離
* 需搭配舞台用 CO₂ 鋼瓶及專用高壓管線
* 建議活動前 1 小時完成設備定位、管線配置及測試
* 密閉或通風不良空間須經現場評估後使用

【適用場合】
* 啟動儀式
* 開幕典禮
* 倒數儀式
* 演唱會
* 音樂祭
* DJ 派對
* 夜店活動
* 品牌發表會
* 運動賽事開場
* 商業演出$description$,
  '/images/products/special-effects/co2-jet/co2-jet-1.jpg',
  '每組 NT$3,500／控施費 NT$3,500',
  true, 6, 1
),
(
  '電動紅彩球',
  'special-effect-electric-red-ball',
  '活動特效',
  $description$【效果介紹】
電動紅彩球以大型紅色球體懸掛於舞台上方，透過電動控制於指定時機開啟，展開預先設計的祝賀布條，打造具有儀式感與驚喜感的揭幕效果。特別適合開幕、揭牌、落成及各類慶典活動。

【效果特色】
* 電動控制開啟，可精準配合活動流程及主持人口令
* 彩球直徑約 70 多公分，舞台辨識度高、畫面喜氣醒目
* 可搭配客製化祝賀布條，呈現活動名稱、賀詞或品牌資訊
* 適合搭配燈光、音樂及倒數流程，強化揭幕瞬間的儀式感

【注意事項】
* 電力需求：110V，瞬間用電
* 建議由專業人員進行安裝及操作
* 現場須提供安全且可承重的吊掛點
* 彩球下方需保留足夠空間，避免布條展開時受到阻礙
* 須事先確認場地是否允許吊掛設備及吊點位置
* 客製化布條需另外製作及報價
* 建議活動前 1 小時完成吊掛、電力配置及開球測試

【適用場合】
* 開幕典禮
* 落成典禮
* 揭牌儀式
* 啟用典禮
* 周年慶典
* 廟會慶典
* 企業活動
* 商場開幕
* 校慶活動
* 大型慶祝活動$description$,
  '/images/products/special-effects/electric-red-ball/electric-red-ball-1.webp',
  'NT$15,000（含控施費）／客製布條另計',
  true, 7, 1
),
(
  '泡泡機',
  'special-effect-bubble-machine',
  '活動特效',
  $description$【效果介紹】
泡泡機可持續產生大量泡泡，快速營造夢幻、歡樂且具有互動感的活動氛圍。泡泡隨著現場氣流自然飄散，搭配舞台燈光或戶外陽光能呈現豐富的視覺效果，適合婚禮、親子活動、舞台演出及各類慶典使用。

【效果特色】
* 可持續產生大量泡泡，快速營造歡樂活動氛圍
* 提供蓄電型及直電型，可依不同場地條件選擇
* 搭配燈光或自然光，可呈現更豐富的視覺效果
* 設備配置彈性高，適合室內、戶外及不同規模活動

【注意事項】
* 提供蓄電型／直電型設備
* 操作簡單，可依活動需求安排人員控制
* 建議保留足夠泡泡飄散空間
* 室內／室外皆可，效果會受風向、空調及現場環境影響
* 需搭配專用泡泡液
* 建議活動前 30 分鐘完成設備定位及效果測試
* 泡泡液可能造成地面濕滑，使用後需視現場狀況清潔

【適用場合】
* 婚禮進場
* 親子活動
* 開幕典禮
* 戶外活動
* 舞台演出
* 校園活動
* 尾牙春酒
* 品牌活動
* 展覽活動
* 商業活動$description$,
  '/images/products/special-effects/bubble-machine/bubble-machine-1.webp,/images/products/special-effects/bubble-machine/bubble-machine-2.webp',
  'NT$3,000（需搭配啟動儀式）',
  true, 8, 1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price_note = EXCLUDED.price_note,
  visible = EXCLUDED.visible,
  sort_order = EXCLUDED.sort_order,
  stock = EXCLUDED.stock;
