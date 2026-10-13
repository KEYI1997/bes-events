# 網站建置與驗收計畫

## 專案摘要

- 目標與客群：為規劃企業活動、開幕典禮、品牌互動或現場服務的台灣企業與主辦人，快速辨識境曜可承接的整合範圍。
- 主要行動與成功指標：訪客選擇接近的活動需求，瀏覽對應服務或填寫真實詢價表單；送出成功後沿用既有 API 與 LINE QR 引導。
- 本次必要：只重製首頁測試版的內容架構、視覺系統、導覽、服務路徑與活動需求定位器；保留現有首頁 SEO、JSON-LD、Supabase 客戶 Logo、詢價 API 與正式圖片。
- 延後：其他服務內頁、後台、訂單與 LINE 綁定流程的視覺重製。
- 不包含：正式網域發布、資料模型或 API 契約修改、捏造客戶成果、評論或活動數據。
- 技術、部署及既有規則：Next.js 16、Supabase、Vercel；僅部署至 `staging/home-design-refresh` 的 Preview。正式追蹤只限 `besevent.com` / `www.besevent.com`，Preview 不得載入正式 GA4、Ads 或 Google Tag。
- 素材與正式內容來源：`public/images/cases/`、`public/images/services/`、`public/images/logo/`、`SERVICE_SEO_PAGES`、現有客戶 Logo CMS、`ContactFormInline`。
- 目前階段與下一步：新版首頁已在 Preview 完成多尺寸與互動驗收，等待使用者於測試網址進行視覺回饋；不會自動進入正式網域。

## 決策與待確認事項

| 日期 | 決策或假設 | 理由 | 影響範圍 | 已確認/待確認 |
|---|---|---|---|---|
| 2026-10-14 | 首頁以「現場執行節奏表」為概念，而非沿用舊首頁的輪播、卡片或檔案冊版型。 | 使用者要求重新製作測試版首頁，且不使用先前版型。 | 首頁元件與專用導覽。 | 已確認 |
| 2026-10-14 | 選用 `Colour chapters`（seed `664583974`）作為構圖方向；採用色塊章節與大尺寸文字。 | 可把活動企劃、服務選擇、案例與聯絡流程呈現為一條清楚的現場節奏。 | 首頁視覺、色彩、段落順序與動效。 | 已確認 |
| 2026-10-14 | 以既有實拍案例與服務圖片為唯一視覺素材，不加入外部示意圖。 | 保持案例與服務內容真實可核對。 | 首頁所有圖片。 | 已確認 |
| 2026-10-14 | 「活動需求定位器」只提供服務路徑建議；不儲存選擇，不取代正式詢價表單。 | 它是可操作的資訊導覽，避免引入新的資料收集或後端依賴。 | 首頁互動。 | 已確認 |

## 頁面與使用流程

| 路由 | 角色 | 目的與主要行動 | 資料來源 | 必要狀態 |
|---|---|---|---|---|
| `/`（Preview） | 企業活動主辦人 | 了解境曜能協助的活動類型，從定位器進入服務頁或詢價。 | 靜態服務資料、實拍案例、Supabase 客戶 Logo、聯絡 API。 | 導覽、需求選擇、服務連結、案例連結、表單成功/錯誤/驗證。 |
| `/services/*` | 企業活動主辦人 | 深入了解選定服務。 | 既有路由與資料。 | 不在本次重製範圍。 |
| `/api/contact` | 詢價訪客 | 提交真實活動需求。 | 既有 API 與資料流程。 | 必填、電話格式、載入、成功、失敗。 |

## 功能驗收

狀態使用：待做 / 開發中 / 待測 / 通過 / 失敗 / 阻擋 / 不適用。

| ID | 角色與操作 | 預期可見結果 | 資料/API結果 | 驗證方式 | 狀態與證據 |
|---|---|---|---|---|---|
| H-01 | 訪客開啟首頁 | 看到新的首頁構圖，不出現舊首頁輪播、舊 Hero 或舊 ServiceTabs。 | 無資料寫入。 | Playwright 1440 / 768 / 390 截圖；各寬度 `scrollWidth === clientWidth`。 | 通過：三種寬度均無水平溢出。 |
| H-02 | 訪客選擇活動需求定位器 | 顯示對應且真實存在的服務說明與服務頁連結。 | 不儲存資料。 | Playwright 點擊「我要讓賓客參與」。 | 通過：內容切換為 AI 互動道具、SHOW GIRL、活動策劃統包連結。 |
| H-03 | 訪客使用首頁導覽 | 桌面與手機導覽可進入服務、案例、詢價區或聯絡頁。 | 無資料寫入。 | Playwright 開啟 390px 行動版導覽。 | 通過：可見活動需求、服務內容、現場案例、整理我的需求四個錨點。 |
| H-04 | 訪客提交有效詢價 | 顯示既有成功狀態與官方 LINE QR。 | 真實 `/api/contact`；只用測試資料，未授權前不送出。 | 空白表單驗證；不送出真實資料。 | 部分通過：空白送出顯示「請填寫所有必填欄位」，未寫入資料；有效送出刻意未測。 |
| H-05 | 訪客在 Preview 開啟首頁 | 新版內容可讀，且沒有正式 Google Tag/GA4/Ads。 | 無正式追蹤事件。 | Vercel Preview 網路資源檢查。 | 通過：未發現 googletagmanager、google-analytics、googleadservices 請求。 |

## 架構與安全（依專案需要）

- 角色及權限矩陣：公開訪客只能讀取首頁及送出既有詢價；管理權限、訂單與客資不在首頁處理。
- 資料模型、API契約與持久化：沿用既有 `clients` 讀取與 `/api/contact` 寫入；本次不改 schema 或 API。
- 本地/測試/正式環境及第三方依賴：本機與 Vercel Preview 僅供測試；正式為 `besevent.com`。Google 追蹤依 Vercel 環境與正式 hostname 保護。
- 需要的環境變數名稱（禁止秘密值）：沿用既有 `NEXT_PUBLIC_SUPABASE_URL`、Supabase 金鑰與既有通知設定；本次不新增。
- 需要授權或尚未接通的整合：未獲授權前不使用真實客資測試提交，也不手動改寫後台資料。

## 設計基準

- 主要設計技能與選定參考：`design-taste-frontend` 的 `Colour chapters`，seed `664583974`；搭配 `copywriting` 撰寫清楚、無虛構證據的首頁文案。
- Stitch/21st 是否使用、設計稿連結或本地檔、用量與連線限制：未使用；現有 Next.js 專案直接實作，避免匯入不必要的相依。
- 選定方向及取捨原因：以飽和色塊與實拍案例作為活動流程的章節，避免上一版的中性檔案冊視覺與傳統服務卡片。概念句：**「境曜把活動企劃、儀式、特效、互動與現場服務，變成訪客能親自選擇的現場執行節奏。」**
- DESIGN.md、tokens與共用元件位置：`DESIGN.md`、`src/app/page.tsx`、`src/components/HomeChapterNav.tsx`、`src/components/HomeMotion.tsx`、`src/components/ActivityPathfinder.tsx`。
- 代表頁與使用者回饋：首頁 `/`；完成 Preview 後由使用者於測試網址檢視。
- 支援語言、寬度、瀏覽器與效能目標：繁體中文；390 / 768 / 1440px；Playwright Chromium；無水平溢出、可鍵盤操作、保留 reduced motion。

## 品質與安全結果

| 檢查 | 實際範圍與工具 | 結果 | 證據 | 限制/未驗證 |
|---|---|---|---|---|
| 設計基準 | design-taste-frontend direction draw 與 inspector | 通過 | seed `664583974`；新版 inspect 無 FAIL。 | inspector 仍建議減少字級數量、避免無影片頁面的提示，屬非阻擋建議。 |
| 程式檢查 | TypeScript、ESLint、design source lint | 通過 | `npx tsc --noEmit`、ESLint、design lint 均成功。 | 僅針對本次首頁相關檔案。 |
| 瀏覽器 | Playwright Chromium | 通過 | Preview 1440 / 768 / 390px 截圖、無水平溢出、需求切換、行動導覽與空白表單驗證。 | 未送出真實客資。 |
| UI 規範 | web-design-guidelines | 通過 | skip link、鍵盤可用導覽、標籤對應表單欄位、`scroll-mt` 錨點與圖片替代文字。 | Vercel Preview 的回饋工具被現有 CSP 擋下，非網站執行路徑。 |
| 安全 | Codex Security security-diff-scan | 通過 | 針對首頁重製差異完成掃描，沒有新發現。 | 本次沒有改 API、資料模型、權限或追蹤邊界。 |

## 問題與變更

| ID | 問題/新需求 | 嚴重度 | 影響 | 修正與重測 | 狀態 |
|---|---|---|---|---|---|
| P-01 | 上一個 Preview 首頁仍殘留舊版型語彙。 | 中 | 首頁測試版。 | 本次以新概念與全新段落順序取代，並檢查三種寬度。 | 已解決 |

## 交付與維護

- 啟動、測試及部署命令：`npm.cmd run dev`、`npx.cmd tsc --noEmit`、`npx.cmd eslint ...`、Playwright CLI、`git push`（僅測試分支）。
- 如何修改內容：服務資料以 `src/lib/seo.ts` 為準；服務表單選項以 `src/lib/services.ts` 為準；首頁專屬視覺在 `src/app/page.tsx` 與其首頁元件。
- 備份/回復及錯誤紀錄方式：以 Git commit 與 Vercel Preview deployment 回復；正式網域不會被此分支推送改動。
- 已知限制、未完成項目與下一步：Preview 的 Vercel Live Feedback 腳本受既有 CSP 阻擋；不影響訪客首頁功能、表單或正式追蹤隔離。有效詢價送出未測，避免產生測試客資。下一步是由使用者在 Preview 提供視覺回饋，再決定是否進一步調整或合併到正式分支。
