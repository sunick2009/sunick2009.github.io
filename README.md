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

## 自動維護

`renovate.json` 設定 npm、GitHub Actions 與 `.nvmrc` 的更新，目標為 `hexo-source`。
一般更新安排在台北時間週一 00:00–06:59，由 App 的實際執行時間決定；不是精確排程。
minor/patch 分組，major 需先在 Dependency Dashboard 核准開 PR，所有更新仍由人工合併。
每月 1 日凌晨整理 lockfile；有來源告警且存在修復版本的安全更新可跳過一般時段與等待期。

啟用方式：在 https://github.com/apps/renovate 安裝 Renovate App，只授權此倉庫，並將本 PR 合併至預設分支。
若 App 建立 onboarding PR，檢查後完成 onboarding。設定檔本身不代表 App 已安裝或開始運作。
已移除本 PR 新增的 Dependabot version-update 設定，避免重複開 PR；GitHub Dependabot alerts 可繼續使用。
若另有啟用 Dependabot security updates，可在 GitHub 設定中擇一負責自動開安全更新 PR。

Dependency Review 在 PR 中檢查新增依賴弱點，high/critical 會使檢查失敗；不是完整 npm audit，也不是分支保護。
如需強制禁止略過檢查合併，另在 GitHub ruleset 將 `blog` 與 `dependency-review` 設為 required checks。
