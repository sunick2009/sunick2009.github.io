---
---
title: SUSU的個人博客開張啦
date: 2020/02/17
tags: 
  - css
  - js 
categories: 修改主題
comments: true
description:
top_img: https://i.imgur.com/gKaHhTW.png
cover: https://i.imgur.com/gKaHhTW.png
---
## 導言
噹噹噹:confetti_ball: :confetti_ball: :confetti_ball: 終於開張啦，在此期許自己會多分享許多有趣的技術文章，或是些生活趣聞

俗話說萬事起頭難嘛，所以第一步就是要弄一個簡單的博客
但是第一步在設定主題的時候就遇到了一些蠢事

---
## 蠢事1

#### 不要自己亂加空白

如下，這是作者給的模板，可是我貼到config怎沒生效呢???
```Yaml
   theme_color:
      enable: true
      main: "#9370DB"
      paginator: "#7A7FF1"
      button_hover: "#FF7242"
      text_selection: "#69c46d"
      link_color: "#858585"
      hr_color: "#A4D8FA"
      read-mode-bg_color: '#FAF9DE'
```

細心的你看出來了吧，這code怎沒對齊呢
因為這個問題，我還以為是作者的code出了問題，跑去載了前幾個版本，不過事實顯示
~~顯然是使用者的問題~~ :worried:

修正如下，順便把我目前的配色放上來啦，反正不錯看的說
```Yaml
theme_color:
  enable: true
  main: "#708adc"
  paginator: "#5a3faa"
  button_hover: "#420457"
  text_selection: "#708adc"
  link_color: "#99a9bf"
  meta_color: '#858585'
  hr_color: "#A4D8FA"
  read-mode-bg_color: '#FAF9DE'
  inline-code-color: '#F47466'
```

---
## 蠢事2

#### 細心點啊
在這個表情符號氾濫的社會，~~私人博客不支持emoji能看麼?~~
好啦，是因為原版的Unicode看了不怎麼喜歡，所以想搞上Twemoji，~~但卻卡在這邊好幾天，畢竟沒學過js(?~~
在這裡分享我怎麼修改的，基於這個主題[hexo-theme-butterfly](https://github.com/jerryc127/hexo-theme-butterfly)

### 第一步
#### 更換你的渲染器，並且安裝emoji插件
原版的渲染器貌似不支援emoji呢，那我們就換成[markdown-it](https://github.com/hexojs/hexo-renderer-markdown-it)吧
首先進入博客目錄，在終端機輸入以下指令安裝
```shell
$ npm un hexo-renderer-marked --save
$ npm i hexo-renderer-markdown-it --save
$ npm install markdown-it-emoji --save
```
### 第二步
#### 在站點配置文件加入以下內容
```Yaml
markdown:
  render:
    html: true
    xhtmlOut: false
    breaks: true
    linkify: true
    typographer: true
    quotes: '“”‘’'
  plugins:
    - markdown-it-abbr
    - markdown-it-footnote
    - markdown-it-ins
    - markdown-it-sub
    - markdown-it-sup
	- markdown-it-emoji ##加入emoji插件
  anchors:
    level: 2
    collisionSuffix: 'v'
    permalink: true
    permalinkClass: header-anchor
    permalinkSymbol: ¶
```
### 第三步
#### 安裝Twemoji
修改`node_modules/markdown-it-emoji/index.js`
```js
'use strict';


var emojies_defs      = require('./lib/data/full.json');
var emojies_shortcuts = require('./lib/data/shortcuts');
var emoji_html        = require('./lib/render');
var emoji_replace     = require('./lib/replace');
var normalize_opts    = require('./lib/normalize_opts');
var twemoji           = require('twemoji') //宣告變數

module.exports = function emoji_plugin(md, options) {
  var defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };

  var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

  md.renderer.rules.emoji = emoji_html;

	//使用 twemoji 渲染
  md.renderer.rules.emoji = function(token, idx) {
	return twemoji.parse(token[idx].content);
  };
  
  md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
};
```
### 第四步
#### 調整尺寸
這裡我參考了這兩篇文章的css內容
[打造个性超赞博客 Hexo + NexT + GitHub Pages 的超深度优化 | reuixiy](https://io-oi.me/tech/hexo-next-optimization/#bb---for---bb)
[Hexo中添加emoji表情 | wakasann Croner](https://www.wakasann.com/2016/10/03/hexoaddemoji/)
融合出了一下內容
```css
//emoji
img.emoji {
	height: 1.5em;
	width: 1.5em;
	margin: 0.05em 0.1em;
	padding: 0px;
	display: inline !important;
	vertical-align: -1.5em;
	border: none;
	cursor: text;
	box-shadow: none;
}
```
直接在`\themes\Butterfly\source\css\index.styl`加入即可
### 第五步
#### 重頭戲來啦
因為我在博客中開啟了fancybox的緣故，文章裡面所有圖片都可以點開大
但是emoji被放大就不是好事了(廢話
那麼我們就得避免他被識別成要被fancybox處理的東西(外面被套一層a標籤)
因此我們得修改有關這個套件的內容
在`\themes\Butterfly\scripts\photo.js`我們可以找到
```js
  if (theme.fancybox.enable) {
    images.each((i, o) => {
      var lazyload_src = $(o).attr('src') ? $(o).attr('src') : $(o).attr("data-src")
      var alt = $(o).attr('alt')
      if (alt !== undefined) {
        $(o).attr('title', alt)
      }
      var $a = $(
        '<a href="' +
        lazyload_src +
        '" data-fancybox="group" data-caption="' +
        $(o).attr('alt') +
        '" class="fancybox"></a>'
      )
      $(o).wrap($a)    
    });
	
  }
```
要怎麼修改呢?，其實在開頭加入點東西忽略下就好，直接加入`.not('.emoji')`即可
結果如下
```js
  if (theme.fancybox.enable) {
    images.not('.emoji').each((i, o) => {
      var lazyload_src = $(o).attr('src') ? $(o).attr('src') : $(o).attr("data-src")
      var alt = $(o).attr('alt')
      if (alt !== undefined) {
        $(o).attr('title', alt)
      }
      var $a = $(
        '<a href="' +
        lazyload_src +
        '" data-fancybox="group" data-caption="' +
        $(o).attr('alt') +
        '" class="fancybox"></a>'
      )
      $(o).wrap($a)    
    });

  }
```
這樣我們就能得到一個正常尺寸的emoji了:tada: :tada: :tada: 
## 小結
雖說好像沒啥內容，不過希望這篇文章能幫到有需要的人嘛:thinking: 
動手做開心多了，畢竟在這漫長的寒假沒啥事做
## 題外話
在打這篇文章的時候在聽這場直播存檔，實在是很喜歡yin的聲音呢，能拉高音，能唱很甜的歌，能用成熟的歌喉唱
但不知道為啥咪他的人氣都不高呢，希望他有一天能成為知名的翻唱歌手:two_hearts: 
**こんばんは～(niconico同時配信)**
[![](http://img.youtube.com/vi/rxjTLGJta9U/0.jpg)](http://www.youtube.com/watch?v=rxjTLGJta9U "こんばんは～(niconico同時配信)")
另外付上頭圖的PIXIV
[鏡のむこう](https://www.pixiv.net/artworks/76243022)