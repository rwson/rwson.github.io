---
layout: post
title: javascript变量提升
date: 2015-07-20
categories: [javascript, 变量提升]
---

在日常开发中有时候可能会遇到下面的情况:

    var var1 = 1;
    function fn() {
        console.log(var1);
        var var1 = 2;
        console.log(var1);
    }
    
    fn();   
    //  undefined
    //  2

第一次遇到的人可能会觉得很奇怪(因为外面定义了同名变量,所以第一次应该打印出1),为什么会有这种情况出现呢？我们把代码改成下面的样子就方便理解了:


    var var1 = 1;
    function fn() {
        var var1;
        //  如果不给变量赋初值,它的值就是undefined
        console.log(var1);
        var1 = 2;
        console.log(var1);
    }

这就是javascript中的变量提升。
MDN上的解释是"变量提升是JavaScript将声明移至作用域scope (全局域或者当前函数作用域) 顶部的行为"。

除了变量,函数也存在变量提升的情况,但是如果用函数直接量法定义一个函数,会报类型异常:


    function fn() {
        fnInner();
        
        var fnInner = function() {
            console.log("inner fn");
        }
    }
    
    fn();
    //  类型异常(undefined is not a function)

就像刚才说的,fnInner会被放到函数体的第一行,但是没有赋初值,所以就成了undefined。

但是如果用正常函数声明的方法就可以被正确调用,就像下面的样子:


    function fn() {
        fnInner();
        
        function fnInner() {
            console.log("inner fn");
        }
    }
    
    fn();
    
甚至有次在angularjs源码中(1.x)看到下面的使用方式:

    function x() {
        //  do something
        return {
            attr1: fn1(),
            attr2: fn2()
            //  ...
        };
        
        function fn1() {
            //  do something
            return {
                //  ...
            };
        }

        function fn2() {
            //  do something
            return {
                //  ...
            };
        }
    }

当时一看觉得很诧异,主要是一般return以后不能再写代码了,但是又仔细一想,是变量提升的作用。

即使变量提升给我们带来了很大的便利(函数可以在被调用之后声明),但是我们也应该养成变量先定义后使用的习惯,一是提升代码的可读性(不至于在函数体内这里定义一个变量那里定义一个变量的),二是不至于出现一些意想不到的错误或异常。

在ES6中,如果我们用let来定义变量,但是在它定义之前使用,就会报错(使用typeof也会异常),可能ES6也强制我们养成"先定义后调用"的习惯吧。

