---
layout: post
title: javaScript中的短路语法
date: 2015-02-26
categories: [技术]
---

在js代码中，以前写判断都是通过最简单的if...else...来判断,最近无意中改了个写法,发现也可以用,而且相对于的判断方法,省去了"if...else...",取而代之的是"&&"或者"||",下面我们一起看下关于短路语法。

与或非语法中，有一种经典的短路语法：
    
	var a = boolean || function(){
		do some thing
	}();
	//	这种情况下,只有当前面的boolean值为false时,才会执行后面的匿名方法
	//	当前面的boolean值为true时,出于性能优化机制,后面的匿名方法就不会继续执行

	var b = boolean && function(){
		do some thing
	}();
	//	这种情况则与上面相反,只有boolean值为true时,才会执行后的匿名方法

再看一个例子：

    if(typeof obj === "undefined") obj = {};
	可以改写成这样
	obj === undefined && (obj = {});
	//	需要注意的是,当判断依据后面的为赋值语句的时候,该语句需加括号，否则会报"无效左值"的错


下面看看传统判断和	短路语法的性能对比：

    var i = 1;
    
    console.time("普通的if else判断");
    for (var j = 0; j < 100000; j++) {
        if (i === 1) {
            i = 2;
        } else {
            i = 1;
        }
    }
    console.timeEnd("普通的if else判断");

    i = 1;
    console.time("短路语法");
    for (var j = 0; j < 100000; j++) {
        i === 1 && (i = 2);
        i !== 1 && (i = 1);
    }
    console.timeEnd("短路语法");

	//	我把两种方法各循环执行了100000次
下面是运行时间对比

![canvas刮刮卡](http://rwson.github.io/assets/img/posts/run-times-compare.jpg)

从图中可见,在一样的执行次数中,短路语法执行需要的时间更短,性能更好