---
layout: post
title: javaScript适配器模式
date: 2015-06-13
categories: [技术]
---

适配器模式:

适配器,顾名思义,我们生活中能见到很多这样的例子,举个最简单的例子吧:
我现在有一台老台式机电脑和刚买的新式电脑,我们都知道,老台式机上的插口都是圆口(F32型插口),而新式电脑上的都是USB插口,假如我现在想在新式电脑上用老式电脑上的那个鼠标,但是插口又不一样,那怎么办呢？我们现在就需要一个转换器来中转,这个转换器就完成了完成由老到新的转换功能。


再举个实际开发中可能会遇到情况:比如公司新进一批前端,然后公司急于做一个项目,需要这几个前端一起参与才能按时交工,但是这几个前端里面有的会prototype.js不会YUI,然后有的会YUI不会prototype.js,而产品经理最后说采取YUI,由于项目时间比较紧,所以没那么大的成本来给他们把这两个库都培训一遍,这时候问题来了,怎么样让这些人都参与到开发中来呢？且看下面的模拟:

我们来模拟一个最简单的选择器
```
    //  模拟prototype $ function(不需要传递任何的形参,直接通过arguments对象取得传入的实参)
    function $(){
        var ele = [];
        for(var i = 0;i < arguments.length;i ++){
            var el = arguments[i];
            if(typeof el === "string"){
                el = document.getElementById(el);
            }
            if(el.length == 1){
                return el;
            }
            ele.push(el);
        }
        return ele;
    }
    
    //  模拟YUI中的get (必须传递一个参数,不是字符串就是数组)
    var YAHOO = {};
    YAHOO.get = function(el){
        if(typeof el === "string"){
            return document.getElementById(el);
        }else if(el instanceof Array){
            var ele = [];
            for(var i = 0;i < el.length;i ++){
                  ele[ele.length] = YAHOO.get(el[i]);
            }
            return ele;
        }else if(el){
            return el;
        }else{
            return null;
        }
    };
    
    //  适配器方法
        function YUIToPrototypeAdapter(){
            //  YUI开发永远传递一个参数
            if(arguments.length == 1){
                //  YUI方案
                var e = arguments[0];
                return $.apply(window,e instanceof  Array ? e : new Array(e));
            }else{
                //  prototype处理方案
                return $.apply(window,arguments);
            }
        }

        YAHOO.get = YUIToPrototypeAdapter;

        window.onload = function(){
            //  $("div1","div2")            prototype风格
            //  YAHOO.get(["div1","div2"])  YUI风格
            console.log($("div1","div2"));
            console.log(YAHOO.get(["div1","div2"]));
        };
    
```

这边的YUIToPrototypeAdapter就是一个适配器方法,根据传入参数类型的不同采取不同的方案处理,相对完美的解决了框架间的适配问题。