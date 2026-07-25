# 境曜有限公司（BES Events）官網

## 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS 4
- **後端/資料庫**: Supabase (PostgreSQL + RLS)
- **郵件通知**: Resend
- **圖示**: Lucide React
- **部署**: Vercel

---

## 本地開發

```bash
npm install
cp .env.local.example .env.local
# 填入 Supabase 和 Resend 金鑰
npm run dev
```

開啟 http://localhost:3000

---

## 部署步驟

### 1. Supabase 設定

1. 前往 [supabase.com](https://supabase.com) 建立新專案
2. 進入 SQL Editor，執行 `supabase-schema.sql` 的全部內容
3. 進入 Storage，建立 bucket 名為 `images`，設為 Public
4. 複製以下金鑰：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Resend 設定（郵件通知）

1. 前往 [resend.com](https://resend.com) 註冊
2. 取得 API Key → `RESEND_API_KEY`
3. （正式上線後建議驗證自有域名）

### 3. Vercel 部署

1. 將專案 push 到 GitHub
2. 前往 [vercel.com](https://vercel.com)，用 GitHub 帳號登入
3. Import 此 repository
4. 設定環境變數：

| 變數名 | 說明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend API 金鑰 |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 後台管理密碼（自訂） |
| `NEXT_PUBLIC_SITE_URL` | 網站網址（https://bes114.com） |

5. Deploy！
6. 在 Vercel 設定 Custom Domain: `bes114.com`

---

## 後台管理

訪問 `/admin` 進入後台管理。

### 功能列表

| 模組 | 功能 |
|------|------|
| 產品管理 | 新增/編輯/刪除產品（啟動儀式、燈光音響、調酒設備等） |
| 案例管理 | 新增/編輯/刪除活動案例（含照片上傳） |
| Show Girl | 新增/編輯/刪除人員資料（含照片上傳） |
| 客戶管理 | 新增/編輯/刪除合作客戶 Logo |
| 評價管理 | 新增/編輯/刪除客戶評價 |
| 諮詢紀錄 | 查看聯絡表單提交紀錄、標記已讀 |
| FAQ 管理 | 新增/編輯/刪除常見問題 |

---

## 頁面結構

```
/                           首頁（Hero + 服務 + 優勢 + 案例 + 客戶跑馬燈 + CTA）
/products/opening-ceremony  啟動儀式
/products/stage-lighting    燈光音響舞台
/products/event-planning    專案企劃
/products/bartending        外派調酒
/showgirl                   Show Girl
/cases                      案例展示
/contact                    聯絡我們
/admin                      後台管理
```

---

## 注意事項

- 後台密碼請設定強度足夠的密碼
- Supabase Storage bucket `images` 需設為 Public
- 正式上線前記得在 Resend 驗證寄件域名
- 建議定期備份 Supabase 資料庫
