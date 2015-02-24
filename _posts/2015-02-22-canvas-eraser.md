---
layout: post
title: canvas刮刮卡
date: 2015-02-22
categories: [技术]
---

上次做项目用到了一个刮刮卡,当时时间太赶,是用的一个插件,也没细看是怎么来的,这几天正好过年,闲来无事,今天就自己写了一个玩玩。

原理就是先在canvas上画一层遮罩,然后把组合方式设置为"裁剪",再去监听指定的事件(pc:["click"],mobile["touchmove","touchend"])之类的事件,同时用getImageData方法取得透明区域所占比例，最后进行比较，达到指定值就执行指定的方法。

下面是效果截图

![canvas刮刮卡](http://rwson.github.io/assets/img/posts/canvas-eraser.png)

[项目地址](https://github.com/rwson/canvas-eraser)