# 境曜有限公司網站 - 部署筆記

## 網站資訊
- **前臺網址**: https://besevent.com
- **後臺網址**: https://besevent.com/admin
- **專案名稱**: bes-events
- **框架**: Next.js
- **部署平台**: Vercel (透過 GitHub 自動部署)

## 部署流程

### 每次修改後的部署步驟：

```bash
# 1. 進入專案資料夾
cd "C:\Users\User\Desktop\客戶管理\08-境曜有限公司\網站架設\bes-events-temp"

# 2. 查看修改了哪些檔案
git status

# 3. 加入所有修改的檔案
git add .

# 4. 建立 commit（描述這次修改的內容）
git commit -m "修改內容描述"

# 5. 推送到 GitHub（Vercel 會自動偵測並部署）
git push

# 6. 等待 1-2 分鐘，Vercel 會自動完成部署
```

### 本地測試（部署前可先測試）：

```bash
# 啟動本地開發伺服器
npm run dev

# 開啟瀏覽器訪問 http://localhost:3000
```

## 注意事項
- 推送到 GitHub 後，Vercel 會自動觸發部署
- 部署通常需要 1-2 分鐘完成
- 如果部署失敗，可以到 Vercel 後台查看錯誤訊息

## 修改紀錄

### 2026-08-03
- 移除浮動導航欄的背景模糊效果 (`backdrop-blur-md`)
- 調整導航欄背景透明度從 30% 改為 70%
