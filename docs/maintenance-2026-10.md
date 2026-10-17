# 2026-10 框架與主題維護

## 上游與版本

查核日期：2026-10-17。基準來源 commit：`02e2958`。

| 元件 | 原設定 | 更新版本 |
| --- | --- | --- |
| Hexo | 4.2.1 | 8.1.2 |
| Butterfly | 2.1.0，內嵌於 themes | 5.7.0，npm 套件 |
| CI Node.js | 12.x | 24.x |
| markdown-it renderer | 4.1.0 | 7.1.1 |
| markdown-it-emoji | 1.4.0，直接修改 node_modules | 3.1.0，獨立擴充 |
| Twemoji | 12.1.6 | @twemoji/api 17.0.3 |

來源：

- https://github.com/hexojs/hexo/releases/tag/v8.1.2
- https://github.com/jerryc127/hexo-theme-butterfly/releases/tag/5.7.0
- https://github.com/jerryc127/hexo-theme-butterfly/blob/5.7.0/_config.yml
- https://github.com/jdecked/twemoji/releases/tag/v17.0.3

## 遷移內容

- 主題改由 npm 管理，移除舊版內嵌副本；不是移除網站內容。
- `source/_data/butterfly.yml` 遷移至 `_config.butterfly.yml`，逐項轉換搜尋、側欄、頭像、分享、留言、程式碼區塊與頁尾設定。
- 保留標題、作者、紫色主色、左側欄、自訂 favicon、既有封面與頭像 URL、Valine app 設定、建站時間及文章 permalink。
- 繁簡切換初始語系修正為繁體，Google Search Console 驗證欄位去除重複前綴。
- 保留既有 canonical 尾端斜線格式。`updated_option: date` 避免新 checkout 的檔案時間被當作文章更新日期；明確 front matter updated 仍可使用。
- RSS / sitemap 原本只在 CI 臨時安裝，現在納入固定依賴。
- 移除未啟用 PWA 所用的 `hexo-offline`、不再需要的舊 Cheerio、EJS renderer 與舊 Twemoji；Cheerio 新版僅供回歸檢查。
- Twemoji 使用正式 Markdown-it 擴充，保留行內圖片，排除燈箱。
- 友情連結資料轉成新版陣列格式，保留原本的範例資料。
- Node.js 24、`npm ci`、固定 Actions commit；新增 PR 建置、輸出檢查及每月 Dependabot。
- 沿用既有 master 分支與 ACCESS_TOKEN 部署方式，改為一般推送，不重寫發布歷史。

## 已完成的驗證

- 舊版可建置，已保存基準輸出進行比對。
- 新 lockfile 可由乾淨 `npm ci` 安裝，Node.js 24.19.0 下 `npm run clean`、`npm run build`、`npm run check` 通過。
- 新版產生 45 個檔案，其中 27 個 HTML 頁面。
- 原有 5 篇文章網址及全部既有 HTML 路徑仍存在。
- 5 篇文章的標題結構與程式碼區塊數量與舊版一致；文章原文未修改。
- 檢查本機連結及資源、canonical、搜尋索引的 5 篇文章、RSS、sitemap、留言容器及 emoji 擴充。
- Chromium 實測首頁顯示 5 篇文章，搜尋 Hexo 可找到既有文章；文章程式碼、Valine 輸入介面、深色切換及 390px 手機寬度檢查通過。未送出留言。
- 瀏覽器環境沒有中文字型，且外部資源使 load 等候逾時，因此未將截圖視為完整視覺驗收。搜尋隔離測試中停用外部圖片請求，其他功能仍使用實際 JS；不據此宣稱所有外部圖片及服務可用。
- Hexo 有時會在記錄 ERROR 後仍以成功狀態結束，因此 CI 額外拒絕建置紀錄中的 ERROR / FATAL。

## 依賴弱點與驗證限制

同日 npm audit：舊 lockfile 回報 58 項（6 critical、28 high、18 moderate、6 low）；升級與相容範圍修補後為 14 項（11 high、3 moderate）。這是受影響套件項目數，包含間接依賴鏈，不等於獨立漏洞數，也不等於靜態網站可被直接利用的漏洞數。

剩餘根源包含 braces、linkify-it、markdown-it、sprintf-js 的 DoS 類公告，上層套件也會被連帶標記。未以 `npm audit fix --force` 降回舊 Hexo／renderer，也未用未經相容性驗證的跨主版本 overrides 掩蓋問題。部署靜態輸出不會執行這些 Node.js 套件，但建置與本機預覽仍有其風險；不要將預覽伺服器當成公開正式服務。

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-22p9-wv53-3rq4
- https://github.com/advisories/GHSA-v245-v573-v5vm
- https://github.com/advisories/GHSA-38c4-r59v-3vqw
- https://github.com/advisories/GHSA-6v5v-wf23-fmfq
- https://github.com/advisories/GHSA-253c-mchw-3w2r
- https://github.com/advisories/GHSA-hp3w-g68c-fv3c

待確認：

- 舊 Universal Analytics ID `UA-158679472-1` 不再載入；需提供 GA4 measurement ID 才能恢復 Analytics。
- Valine 已保留既有 app 與文章路徑，但沒有送出測試留言，後端可用性與歷史留言仍需在正式網域確認。
- 既有 Imgur 圖片、CDN、第三方統計與範例友情連結不由本倉庫控制，不能以建置成功推定可用。
- 主題跨三個主版本，會有上游 UI 差異；沒有宣稱像素一致。
- 尚未合併或部署，本次變更不代表正式站已更新。
