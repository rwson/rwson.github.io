---
layout: post
title: fetch中的Timeout
date: 2016-07-10
categories: [ES6, fetch]
---

随着ES6的普及,fetch已经渐渐取代了普通ajax在异步请求中的位置,以前在用jQuery中的ajax时,可以指定一个timeout属性,设置该请求的超时时间,但是原生的fetch并不支持该属性,如果遇到遇到一个请求一直pedding状态,就只能干等着,什么也干不了。由于fetch本身在被初始化后返回一个Promise对象,我们就可以对其再包一层Promise来实现在fetch请求中加入timeout的功能。

先来看下fetch的基本用法:

    fetch("some url", {
        "method": "POST",
        "body": JSON.stringify({
            "key": "value",
            "arr": [1,2,3]
        }),
        ...
    })
    //  parse response to JSON object
    .then((res) => res.json())
    .then((res) => {
        //   success dome something
    })
    .catch((ex) => {
        //  exception occurded
    });
    
在Promise中有个静态方法,叫[Promise.race()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race),该方法接受一个数组作为参数,数组中的每个元素都是一个Promise的实例,大致用法如下:

    let promise1 = new Promise((resoleve, reject) => {
        //  do something
    });
    
    let promise2 = new Promise((resoleve, reject) => {
        //  do something
    });
    
    //  ...
    
    let race = Promise.race([promise1, promise2, ...]);

它返回一个Promise,该Promise根据传入的Promise的第一个完成状态(resolve/reject),只要该Promise已完成,就将其返回。

看个下面的例子:
    
    const promise1 = new Promise((resolve, reject) => {
        //  1s后执行reject
        setTimeout(() => {
            reject("reject");
        }, 1000);
    });
    
    const promise2 = new Promise((resolve, reject) => {
        //  2s后执行resolve
        setTimeout(() => {
            resolve("success");
        }, 2000);
    });

    const racedPromise = Promise.race([promise1, promise2]);
    
    racedPromise()
    .then(() => {
        alert("success");
    })
    .catch(() => {
        alert("fail");
    });
    
//  显然上面的代码最终会弹出fail,因为promise1的状态比promise2先确定,所以Promise.race最终返回的是Promise1,由于状态是reject,所以走到了catch回调。

上面说了好多废话:

下面实现一个可设置timeout的fetch:

    /**
      * @param url      请求地址
      * @param opt      配置参数
      * @param timeout  
      **/
    function abortFetch(url, opt, timeout) {
        if(typeof url !== "string") {
        }
        const fetchIns = fetch(url, opt || {});
        const abortIns = new Promise((resolve, reject) => {
            if(typeof timeout === "number" && timeout > 0) {
                setTimeout(() => {
                    reject({
                        "type": "abord"
                    });
                }, timeout);
            }
        });
        const finalPromise = Promise.race([fetchIns, abortIns]);
        return finalPromise;
    }

    //  用法
    
    fetch("/fetch-timeout", {
        "method": "POST"
    })
    .then((res) => res.json())
    .then((res) => {
        if(res.status >= 200 && res.status < 300 || res.status === 302) {
            //  do something response success
        } else {
            //  do something response failed
        }
    })
    .catch((ex) => {
        switch (ex.type) {
            case "abord": 
                //  do something when request abord
            break;
            
                ...
            
            default:
                //  ...
            break;
        }
    });

到这里,就利用Promise.race实现了一个可配置超时时间的fetch
