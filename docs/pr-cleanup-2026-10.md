# 舊 Dependabot PR 整理

此批以 #31 整合 #21、#22、#23、#26、#28、#29、#30；#25 的 Markdown renderer 更新已由 #28 涵蓋。#32 不在此批合併範圍。

- Hexo 6.3.0、hexo-deployer-git 4.0.0、hexo-renderer-markdown-it 6.1.0、hexo-renderer-ejs 2.0.0、Cheerio 1.0.0-rc.12；保留 Butterfly 2.1.0。
- 解決 lockfile 衝突，保留 json5、minimatch、moment、decode-uri-component、minimist 等修正。
- 修正舊主題的 Cheerio 片段解析，避免在文章內輸出巢狀 HTML 文件。
- CI 使用 Node 24、固定 Actions commit、npm ci；保留自訂 emoji 檔案。RSS/sitemap 改列明確依賴，避免 CI 安裝時臨時改動依賴。
- PR 僅建置與檢查；hexo-source push 才執行既有 master 部署。部署仍使用既有 ACCESS_TOKEN 與 force-push，未改變發布分支策略。

驗證：乾淨 npm ci、clean/build 與 tools/check-legacy-site.cjs 通過。27 個頁面、5 篇文章、站內連結與資源、搜尋、RSS、sitemap、service worker 檢查通過。排除產生的程式碼行號後，5 篇文章正文與舊版建置一致。

npm audit 仍為 42 項（1 critical、20 high、17 moderate、4 low），這是舊 PR 的有限更新，不代表已完成全面安全升級。未以 overrides 或忽略設定隱藏問題。完整框架／主題升級、Renovate 與其他 CI 工作仍在 #32。
