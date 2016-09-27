---
layout: post
title: 我理解的apply和call
date: 2015-02-24
categories: [javascript]
---

方法定义:

语法：call([this[,arg1[, arg2[,   [,.argN]]]]])

定义：调用一个对象的一个方法，以另一个对象替换当前对象。

说明：call 方法可以用来代替另一个对象调用一个方法。call 方法可将一个函数的对象上下文从初始的上下文改变为由 this 指定的新对象。如果没有提供 this 参数，那么 Global 对象被用作 this。

语法：apply([this[,argArray]])

定义：应用某一对象的一个方法，用另一个对象替换当前对象。

说明：如果 argArray 不是一个有效的数组或者不是 arguments 对象，那么将导致一个 TypeError。如果没有提供 argArray 和 this 任何一个参数，那么 Global 对象将被用作 this， 并且无法被传递任何参数。

两者区别微乎其微(除了调用对象传的参数一致，apply传入的参数是逐个传入，而apply是通过一个数组传的)

示例:

//  做绑定参数之用

    function sum(x,y){
        return x + y;
    }

    function call1(num1,num2){
        return sum.call(this,num1,num2);
    }
    //  call调用sum

    function apply1(num1,num2){
        return sum.apply(this,[num1,num2]);
    }
    //  apply调用sum

    console.log(call1(10,20));
    console.log(apply1(16,20));

//  扩充作用域，对象和方法不需要有任何关系

    window.color = "red";

    var obj = {
        "color":"blue"
    };

    function showColor(){
        console.log(this.color);
    }

    showColor.call(this);

    showColor.call(obj);
    //  通过指定调用者来区分作用域


//  实现继承

     function obj(name){
         this.name = name;
         this.showName = function(){
             console.log(this.name);
         }
     }
     // obj对象

     function Cat(name){
         obj.call(this, name);
         // 继承obj对象
     }

     var cat = new Cat("A Cat");
     cat.showName();

//  模拟实现call方法

    function test1(a,b){
        return a + b;
    }
    //  定义普通的方法

    function Obj(x,y){
        this.x = x;
        this.y = y;
        //  指定Obj的属性x和y就是传入的x和y
        return x * y;
    }
    //  定义一个对象

    var o = new Obj(10,20);
    //  实例化一个Obj对象

    console.log(test1.call(o,o.x, o.y));

    o.method = test1;
    //  实例化对象的临时变量，用于接受调用者
    console.log(o.method(o.x, o.y));
    delete  o.method;
    //  调用完以后删除临时变量

//  此外，也可以用来判断类型

    console.log(Object.prototype.toString.apply(o));
    console.log(Object.prototype.toString.call(o));