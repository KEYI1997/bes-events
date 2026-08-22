# Facebook 案例同步設定

網站程式已可將境曜粉專的最新貼文同步成「案例管理」中的未發布草稿，並在每天台灣時間 02:15 執行一次。同步只保留原始文案並使用關鍵字分類，不會呼叫任何 AI 服務。

請在 Vercel 專案的 **Settings → Environment Variables** 同時設定 Production、Preview、Development：

| 變數 | 值 |
| --- | --- |
| `FACEBOOK_PAGE_ID` | `1236482399542442` |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | 由境曜粉專產生的長效 Page Access Token |
| `FACEBOOK_GRAPH_API_VERSION` | `v26.0` |
| `CRON_SECRET` | 自行產生的高強度隨機字串 |

請勿把任何 Access Token 放進 GitHub、程式碼、截圖或聊天室。設定完成後，在 Vercel 重新部署一次，登入 `/admin/cases` 按「從 Facebook 同步」即可先手動測試。同步進來的案例預設不會顯示在前台；檢查內容與分類後，在案例編輯視窗勾選「顯示於前台」才會發布。

Graph API Explorer 產生的測試 Token 可能過期，不適合直接放進 Vercel。請在 Meta 的 Access Token Debugger 以「境曜有限公司」App 將用戶 Token 延長後，再取得對應的 Page Access Token。
