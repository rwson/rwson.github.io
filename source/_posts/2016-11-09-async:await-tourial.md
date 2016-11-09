---
layout: post
title: async/await学习
date: 2016-11-09
categories: [javascript, ES6, async/await]
---

在处理javascript中异步的时候,回调往往是最让人恶心的,之前介绍过用[Promise](http://123.207.98.169:81/2016/05/04/2016-05-04-es6-promise/)来处理异步的问题,但是即使用上了Promise,在处理回调上还是会有各种嵌套,今天介绍学习了async/await,由于在Nodejs中还未得到支持,所以需要借助一些npm包来实践,在这里用的是[asyncawait](https://github.com/yortus/asyncawait)。

先来个原生文件读取的例子:

    const fs = require("fs");
    fs.readFile("test.txt", (ex, res) => {
       console.log(res.toString()); 
       
       //   do something...
       
       fs.readFile("test2.txt", (ex, res) => {
            console.log(res.toString());
            
            //  do something
       });
    });
    
    //  控制台输出
    xxxxx
    yyyyy
    
    
下面我们再用async/await实现一遍:

    const async = require("asyncawait").async;
    const await = require("asyncawait").await;
    let readFile = function(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (ex, res) => {
                if (ex) {
                    reject(ex);
                }
                resolve(res);
            });
        });
    }
    
    let asyncReadFile = async(() => {
        
        let fs = await (readFile("test.txt"));
        let fs2 = await (readFile("test2.txt"));
        
        console.log(fs.toString());
        console.log(fs2.toString());
    });
    
    asyncReadFile();
    
虽然代码可能比上面的多了一点,但是已经完全看不到回调嵌套的影子了,也能完成同样的功能,何乐而不为。😉

下面我们再来模拟一个异步请求的例子:

    const async = require("asyncawait").async;
    const await = require("asyncawait").await;
    const http = require("http");
    
    http.createServer((req, res) => {

        switch (req.url) {
    
            case "/async-await":
                setTimeout(() => {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("request end");
                }, 5000);
                break;
    
            case "/async-await2":
            	setTimeout(() => {
            		res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("request end2");
            	}, 8000);
            	break;
    
        	default:
        		break;
    
        }
    }).listen(3000, "127.0.0.1");

    let requestUrl = function(path) {
        return new Promise((resolve, reject) => {
            http.get({
                hostname: 'localhost',
                port: 3000,
                path: path,
                agent: false
            }, (res) => {
                res.on("data", (data) => {
                    resolve(data);
                });
                res.on("error", (ex) => {
                    reject(ex);
                })
            });
        });
    }
    
    let asyncRequest = async(() => {
        let resp, resp2;
        await (requestUrl("/async-await").then((res) => {
        	console.log(res.toString());
            resp = res.toString();
        }).catch((ex) => {
            resp = "发生错误!";
        }));
    
        await (requestUrl("/async-await2").then((res) => {
            resp2 = res.toString();
        }).catch((ex) => {
            resp = "发生错误!";
        }));
        console.log(resp);
        console.log(resp2);
    });
    
    asyncRequest();
    
    //  控制台输出
    request end
    request end2

由此我们可以将async/await用在很多地方,比如例子中的文件读取、异步请求、nodejs中的查询数据库等等。
