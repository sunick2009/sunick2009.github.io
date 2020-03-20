---
---
title: 利用 Travis CI 做自動化部署
date: 2020/02/18
tags: 
  - deploy
  - CI
categories: 教學
comments: true
description:
top_img: https://i.imgur.com/iLeCvsr.jpg
cover: https://i.imgur.com/iLeCvsr.jpg
---
## 導言
當你打造好了漂漂亮亮的網站當然是就要部署啊，所以這篇我們來談談部署吧:grin: 
這邊我採用的方案是部署到GitHub Pages上，畢竟不用錢(~~hen窮~~ 想省錢 :dollar: :dollar: :dollar:
不過我們來看看Hexo的官方文檔，支援相當多部署的方式呢，有[GitHub Pages](https://hexo.io/docs/github-pages)、[GitLab Pages](https://hexo.io/docs/gitlab-pages)、[Heroku、
Netlify、Rsync、OpenShift、etc.....](https://hexo.io/docs/one-command-deployment)

---
## 利用 Travis CI 做自動化部署
這是甚麼東西呢，我們來看看WIKI對**CI**的解釋:thinking: 
>持續整合（英語：Continuous integration，縮寫CI），又譯為持續集成，是一種軟體工程流程，是將所有軟體工程師對於軟體的工作副本持續整合到共享主線（mainline）的一種舉措。
該名稱最早由[1]葛來迪·布區（Grady Booch）在他的布區方法[2]中提出，在測試驅動開發（TDD）的作法中，通常還會搭配自動單元測試。
持續整合的提出主要是為解決軟體進行系統整合時面臨的各項問題，極限編程稱這些問題為整合地獄（integration hell）。

這是什麼意思呢，也就是說，這其實要就像是工廠流水線一般的自動化方法，
通常來說是用來做自動化測試之類的，不過在我們這邊用來做部署博客的應用，就是讓我們做完任何一個commit並且push到remote後
可以自動化的部署到我們的生產環境，也就是我們的博客頁面，我們可以看到連[Hexo的官方文檔](https://hexo.io/docs/github-pages)都推薦我們這麼做

### 第一步
#### 跟著他提供的教學做
~~這不是廢話嘛~~ :rage:，如果文檔看不慣英文的話，右上角可以切換到中文
但是重點來了，GitHub Pages在去年改了一些措施
![](https://i.imgur.com/K5SdrFY.png)
如果我們按照官方文檔操作的話，最後會開了一個分支叫做gh-pages，裡面放了我們的網頁，但這樣就不符合我們的需求了
<img src="https://i.imgur.com/28LGb77.jpg" width="50%" height="50%">
好啦，以上是梗圖，勿當真，本來看文檔就應注意時間吧，~~所以是使用者的問題~~
所以當我們操作到第八步的時候，我們得先停下來
來去看看英文版的文檔就會看到某位老哥提供了很好的解決辦法
>There is a big mistake in step 8.
As user page, github must be built from only the master branch, but the config in .travis.yml is deploy static pages to gh-pages. That can only only result 404 when view usename.github.io.
Correct must be below, see detail in the comment messages.
>>By sherllo

```yaml
sudo: false
language: node_js
node_js:
  - 10
cache: npm
branches:
  only:
    - hexo-source # store source code of hexo in hexo-source branch
script:
  - hexo generate
deploy:
  provider: pages
  skip-cleanup: true
  github-token: $GH_TOKEN
  keep-history: true
  # added
  target_branch: master # generate static files to master
  on:
    branch: hexo-source # source code of hexo
  local-dir: public
```
這當然是很好的解決方案，當我們都使用到git這個強大的板控系統時，我們就有了分支*branch*這好用的東西
那麼開一個branch *hexo-source* 來放我們的原始檔，原本的 *master* 拿來deploy就好了嘛
### 第二步
#### 自定義我們的config
這邊我參考了這篇文章[Github 使用 Travis CI 实现 Hexo 博客自动部署](https://michael728.github.io/2019/06/16/cicd-hexo-blog-travis/)
加上我的主題還有些依賴，以及我另外還要搞Twemoji的緣故，所以比一般的長，這邊先附上我使用的config
```yaml
sudo: false
language: node_js
node_js:
  - 10 # use nodejs v10 LTS
cache: npm
before_script:
  - npm install cheerio@0.22.0 –save # prepare theme
  - npm install hexo-renderer-pug hexo-renderer-stylus --save
  - npm un hexo-renderer-marked --save # change render
  - npm install hexo-renderer-markdown-it --save
  - npm install markdown-it-emoji --save # add emoji plugin
  - npm install hexo-generator-search --save # prepare local search
  - npm install hexo-generator-feed # prepare rss
  - npm install hexo-generator-sitemap # prepare sitemap
  - git fetch #add edited file
  - git checkout -- node_modules/markdown-it-emoji/index.js
branches:
  only:
    - hexo-source # get the source code 
script:
  - hexo clean
  - hexo generate # generate static files
deploy:
  provider: pages
  skip-cleanup: true
  github-token: $GH_TOKEN
  target-branch: master # put the page to where it should be
  keep-history: true
  on:
    branch: hexo-source # source code of hexo
  local-dir: public
```
簡單說下我特別做了什麼，其他的看看簡單的註解你就會懂了，~~其實只是裝裝插件而已~~
#####
:one: 
這邊你需要先讀上面那篇文章，了解Travis CI的工作流程，或是瀏覽[官方文檔](https://docs.travis-ci.com/user/job-lifecycle/)
我這邊特別做與上面那篇文章不同的是
他用的是`before_install:`我用的是`before_script:`，為什麼呢
因為當你仔細觀察Travis CI的Job log就會發現
```shell
$ npm ci 
npm WARN prepare removing existing node_modules/ before installation
> core-js@2.6.11 postinstall /home/travis/build/sunick2009/sunick2009.github.io/node_modules/core-js
> node -e "try{require('./postinstall')}catch(e){}"
> ejs@2.7.4 postinstall /home/travis/build/sunick2009/sunick2009.github.io/node_modules/ejs
> node ./postinstall.js
> fsevents@1.2.11 install /home/travis/build/sunick2009/sunick2009.github.io/node_modules/nunjucks/node_modules/fsevents
> node-gyp rebuild
make: Entering directory '/home/travis/build/sunick2009/sunick2009.github.io/node_modules/nunjucks/node_modules/fsevents/build'
  SOLINK_MODULE(target) Release/obj.target/.node
  COPY Release/.node
make: Leaving directory '/home/travis/build/sunick2009/sunick2009.github.io/node_modules/nunjucks/node_modules/fsevents/build'
added 600 packages in 5.118s
```
第二行他告訴了我們進行`npm ci`前你他會把它先把本地安裝的模組給刪掉，才進行`npm ci`，我看是部署環境吧，看這裡有詳細 [npm ci 命令](https://blog.csdn.net/csdn_yudong/article/details/84929546)

~~所以我們需要裝的東西得等到他先裝完他所需要的~~ `npm ci`是作為自動化部署使用的，所以我們在根目錄的`package-lock.json`會跟他講要裝那些東西

基本上，`before_script`這步就不是很需要了，可以刪除大多數install的東西，不過為了保險起見你也是可以留下啦，只是部署的時間會稍微拉長

#####
:two: 
這邊因為我想安裝**Twemoji**，所以得更動`node_modules/markdown-it-emoji/index.js`裡的內容
所以就預先存到repo，拉下來即可
```shell
$ git fetch 
$ git checkout -- node_modules/markdown-it-emoji/index.js
```

---
### 完成
基本上，都弄完config之後，只要在git上push到remote之後
Travis CI就會自動介入來去處理我們的頁面，而且我們可以在Travis CI地Dashboard看到她處理我們的檔案
通常不用2-3分鐘我們就會看到他passed了，同時也會在電子郵件收到通知，我們也會在github的repo看到他做的commit
![](https://i.imgur.com/9nLiFy8.jpg)
![](https://i.imgur.com/yWDQ0rF.jpg)
*灑花* :tada: :tada: :tada:
然後你就可以前往你的網址中看到你的網頁了
## 總結
搞這個其實還滿有趣的，而且以後只要在能git的環境下都能寫博客啦，真ㄅㄧㄤˋ !:laughing: