---
layout: post
title: javascript门面模式
date: 2015-06-21
categories: [javascript, 设计模式]
---

在javascript中，门面模式常常是开发人员最亲密的朋友。它是几乎所有javascript库的核心原则。通过创建一些使得方法让复杂系统变得更加简单易用,门面模式可以使库提供的工具更容易理解。

先来看看门面模式的写法:

    function a(x){
        //  do something...
    }
    
    function b(y){
        //  do something...
    }
    
    /**
     * 把a和b封装成一个方法(在一个方法里同时调用a、b)
     * @param x
     * @param y
     */
    function facadeAB(x,y){
        a(x);
        b(y);
    }

在我们平时开发中,可能就用到了门面模式,比如我们现在封装一个绑定事件的方法:

    function bindEvent(el,ev,fn){
        if(el.addEventListner){
            el.addEventListener(ev,fn,false);
        }else if(el.attachEvent){
            el.attachEvent("on" + ev,fn);
        }else{
            el["on" + ev] = fn;
        }
    };
    
这个就是一个门面模式,里面对于事件的绑定是隐蔽的,只提供bindEvent给其他地方调用。

再来看个例子,这次我们给一个dom元素给些css样式,就可以用下面的方法实现:

    window.onload = function(){
        setStyle(["div1","div2","div3"],{
            "width":"300px",
            "height":"300px",
            "backgroundColor":"red",
            "font-size":"70px"
        });
    };

    /**
     * 简单的门面模式
     * @param ele
     * @param css
     */
    function setStyle(ele,css){
        for(var i = 0;i < ele.length;i ++){
            for(var j in css){
                (j in css) && (document.getElementById(ele[i]).style[j] = css[j]);
            }
        }
    }

在不使用门面模式的时候,完成这个功能可能需要下面这样来写:

    window.onload = function(){
        var ele = document.getElementById("div1"),
            ele2 = document.getElementById("div2"),
            ele3 = document.getElementById("div3"),
            eleArr = [ele,ele2,ele3];
            
        for(var i = 0,l = eleArr.length;i < l;i ++){
            ele[i].style.width = "300px";
            ele[i].style.height = "300px";
            .
            .
            .
        }
    }; 

其实在jQuery或者其他很多前端类库中,用很多这样的接口,它们都给我们提供了门面模式,使得我们只需要调用一个方法就免去了很多的兼容性写法(比如ajax)。

门面模式大概有下面几个优点

1.解耦(降低了客户端与子系统的耦合关系,让子系统内部的模块能更容易扩展和维护)    
2.简单易用(只需要调用门面接口,即可完成某些特定功能)    
3.更好的划分访问层次(有些方法是对内的,有些方法是需要暴露到外部的,这样既方便外部使用,又方便内部维护)
