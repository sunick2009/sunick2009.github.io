# SUSU's BLOG

Hexo 8.1.2 / Butterfly 5.7.0，使用 Node.js 24。

```sh
nvm use
npm ci
npm run clean
npm run build
npm run check
npm run server
```

文章位於 `source/_posts/`；網站設定在 `_config.yml`，主題個人設定在 `_config.butterfly.yml`。
Butterfly 由 npm 安裝並由 `package-lock.json` 固定版本，請勿修改 `node_modules`。
Twemoji 擴充位於 `lib/markdown-it-twemoji.js`，樣式位於 `source/css/custom.css`。

PR 會執行建置及輸出檢查，不部署。合併至 `hexo-source` 後，通過檢查的輸出才會推送至既有 `master` 發布分支。
部署沿用既有 `ACCESS_TOKEN` secret，需要能寫入本倉庫；一般推送保留發布歷史，不再 force push。

升級紀錄與驗證限制請見 [docs/maintenance-2026-10.md](docs/maintenance-2026-10.md)。
