---
---
title: 升級Linux
date: 2020/02/23
tags: 
  - ubuntu
  - upgrade
categories: 筆記
comments: true
description:
top_img: https://imgur.com/J3MOpjn.png
cover: https://imgur.com/J3MOpjn.png
---
## 導言
最近在做定期的SERVER維護，來筆記下做版本升級所發現的事好了:grin: 

---
## "-d"的差異

通常做版本身升級，都是直接
```shell
$ sudo do-release-upgrade
```
可是如果在本身版本是LTS的情況下，在發布時間的前後就會有*No new release found*的情況，所以就要補上參數讓他強制升級
我的情況是已經放到離最新版本好遠了，也是同樣情況，所以也得上`-d`參數
```shell
$ sudo do-release-upgrade -d
```
這樣就可以了

來源資料

[Why am I not getting the Ubuntu 18.04 upgrade?](https://askubuntu.com/questions/1028949/why-am-i-not-getting-the-ubuntu-18-04-upgrade)
[Upgrading LTS to LTS (server) — why wait for the first point release?](https://askubuntu.com/questions/125825/upgrading-lts-to-lts-server-why-wait-for-the-first-point-release)
[How do I upgrade to a newer version of Ubuntu?](https://askubuntu.com/questions/110477/how-do-i-upgrade-to-a-newer-version-of-ubuntu)

---
## 升級後web伺服器頁面爆炸

當我升級完後，發現php貌似被系統關掉了，開啟頁面只會看到純文字的php文件
第一時間去檢查`/etc/apache2/mods-enabled`就發現了php不再裏頭
那麼我們就只要
```shell
$ sudo a2emnod php7.2
$ sudo systemctl restart apache2
```
這樣就搞定了

---
## 題外話
附上頭圖的[PIXIV](https://www.pixiv.net/artworks/78157723)