---
layout: post
title: Gulp插件的研究
date: 2016-11-29
categories: [javascript, Gulp, 构建工具]
---

在网页端功能越来越繁杂的今天,随着功能的增多,代码量也必不可少的多个,代码量一多,web性能就显得尤为重要,尤其是加载方面,时间太长,可能用户就没心情等下去,所以现在的web项目一般都在发布的时候进行一版自动构建,从原来的grunt到gulp,再到现在的webpack。


今天研究了下gulp插件,写点心得体会吧。看了两个gulp插件源码,发现里面都引入了[through2](https://github.com/rvagg/through2)这个包,官方的说法就是"Node Stream的简单封装，目的是让链式流操作更加简单;",就也照葫芦画瓢,引用了这个包,简单实现一个gulp插件,功能就是压缩css,并且把css中的"background: url(xxxx.png)"中的"xxxx.png"转换成base64编码的形式,减少http请求数。


    "use strict";

    const through = require("through2"),
        path = require("path"),
        fs = require("fs"),
    
        //  引用async/await,方便处理文件读写的异步操作
        async = require("asyncawait").async,
        await = require("asyncawait").await,

        //  匹配url(../xxx.yyy)这种表达式
        imgReg = /url\s*\((\s*[A-Za-z0-9\-\_\.\/\:]+\s*)\);?/gi,

        //  将fs.readFile封装成Promise
        readFile = (path) => {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (ex, file) => {
                    if (ex) {
                        reject(ex);
                    }
                    resolve(file);
                });
            });
        };

    let base, contents, match, tmp, url;
    
    //  暴露出去的函数
    module.exports = (opt) => {
    
        return through.obj(function(file, enc, cb) {
    
            //  文件为空直接执行回调函数
            if (file.isNull()) {
                cb(null, file);
            }
    
            //  取得当前css的绝对路径
            base = file.base;
    
            //  匹配css中的无效字符,并且转换成buffer
            file.contents = new Buffer(file._contents.toString()
                //  去换行符
                .replace(/\n/gm, "")
    
                //  去"{"之后到第一条样式间的空白字符
                .replace(/\{\s+/g, "{")
    
                //  去";"之后的空白字符
                .replace(/\;\s+/g, ";"));
    
            //  将文件内容转换成普通字符串并缓存
            contents = file.contents.toString();
    
            //  取得url(../../xxx.yyy),并且缓存
            match = contents.match(imgReg);
    
            //  async-await读取图片文件成base64编码
            async(() => {
    
                //  遍历之前的缓存项
                match.forEach((item) => {
    
                    //  拼凑文件绝对路径
                    url = item.replace("url(", "").replace(")", "").trim();
    
                    //  用await读取文件,避免嵌套
                    tmp = await (readFile(path.resolve(base, url)));
    
                    //  替换之前匹配的字符串
                    contents = contents.replace(item, `url(data:image/png;base64,${tmp.toString("base64")})`);
                });
    
                //  把文件内容转成buffer
                file.contents = new Buffer(contents);
    
                //  回调函数
                cb(null, file);
    
            })();
        });
    
    };

至此,一个简单的插件就实现了,当然,还有很多不足,比如对图片进行压缩,减少base64字符串的长度,用request模块处理对网络图片的引用等等。
