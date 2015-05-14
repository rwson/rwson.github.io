---
layout: post
title: Mac环境下配置jdk
date: 2015-05-14
categories: [技术]
---

由于本人的系统是 OS Yosemite 10.10.3,自带jdk 1.8,但是平时用不到这么高的版本,jdk 1.6足矣,但是安装完了，怎么设置它的默认jdk路径呢？

1.我们先下载jdk 1.6,具体可百度一下,这玩意一找一大堆。

2.安装jdk1.6,把下载好的dmg文件安装到Mac中。

3.然后先查看默认的jdk版本,打开iTrem或者Terminal控制台,输入java -version,看控制台打印出什么东西,如果不是刚才安装的版本,就需要重新配置。

4.修改默认jdk默认版本需要我们修改profile,具体方式有2种。

第一种：

    在控制台输入cd ~,进入用户目录
    然后运行open .bash_profile命令
    如果文件不存在,先运行touch .bash_profile创建profile文件
    然后再运行open -e bash_profile编辑profile文件
    打开profile文件,Mac会用自带的编辑器打开profile文件
    然后我们输入export JAVA_HOME=/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Home
    command + s保存,再控制台再运行.source bash_profile命令,就可完成对jdk的配置。

第二种：

    在控制台输入cd ~,进入用户目录
    在控制台运行vi .bash_profile,即可进行profile的编辑
    同样输入jdk的路径,然后按下esc,再输入:wq保存并退出vim编辑器
    再在控制台运行.source bash_profile,应用刚才的设置,即可。

5.走完上面的几步之后,jdk版本应该配置成功了,可以在控制台输入java -version查看java版本来确认是否为我们需要的版本。