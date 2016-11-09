---
layout: post
title: javascript中Date细节
date: 2016-08-30
categories: [javascript, Date]
---

##### Safri浏览器new Date("yyyy-mm-dd")返回invalid Date

许多时候我们需要初始化一个具体某天的日期对象的时候,会用到new Date(),这个方法,我们可以传入一个字符串作为参数来指定具体的日期,而一般我们会传入一个"yyyy-mm-dd hh:ii:ss"这种格式作为一个初始日期,但到了Safri浏览器下,就会返回一个invalid Date,调用该Date实例下的所有方法都会返回NaN值,原因是Safri不能正常解析中间的"-"分隔符,解决办法也很简单,有两种:

直接

    var myDate1 = Date.parseExact("29-11-2010", "dd-MM-yyyy");
    var myDate2 = Date.parseExact("11-29-2010", "MM-dd-yyyy");
    var myDate3 = Date.parseExact("2010-11-29", "yyyy-MM-dd");
    var myDate4 = Date.parseExact("2010-29-11", "yyyy-dd-MM");

或者

    new Date("2011-04-12".replace(/-/g, "/"));

##### setMonth溢出问题

实例化一个Date对象,通过如下的方式,然后调用该实例的setMonth方法,把当前月份加1,就像下面这样

    var date = new Date("2016/01/30");
    date.setMonth(date.getMonth() + 1);
    console.log(date.getMonth());       //  Tue Mar 01 2016 00:00:00 GMT+0800 (CST)
    
或者

    var date = new Date("2016/10/31");
    date.setMonth(date.getMonth() + 1);
    console.log(date);                 //  Thu Dec 01 2016 00:00:00 GMT+0800 (CST)
    
上面两段我们都希望是返回的是2月和11月,但是真正返回了3月和12月

出现这种情况的原因是2月没有28/29号以后的日期,而当前日期对象的日期为30号,调用setMonth,就导致溢出,下面的例子同理。

解决办法也很简单,在调用setMonth之前,拿下个月的最后一天和当前的比较下,再做相应处理就好,或者更简单粗暴的方法,把当前Date对象的date改成1,哈哈。

