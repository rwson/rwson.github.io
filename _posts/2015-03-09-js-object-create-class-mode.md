---
layout: post
title: javaScript面向对象 — 创建类常用模式
date: 2015-03-07
categories: [技术]
---

javaScript创建类常用模式常用模式:   
严格意义上,在ECMAScript6出来之前,js中是没有类的概念的,但是聪明的人类想到了用方法和原型类模拟类的一些特性,比如一个对象经过new关键字实例化以后就具有了某些属性,方法。

下面我们就看下常用的创建类的一些常用模式:
   
1.工厂模式

    function Person(name,sex,age){
        var obj = {
            "name":name,
            "sex":sex,
            "age":age,
            "say":function(){
                console.log("hello world!");
            }
        };
        return obj;
    }
	//	工厂模式就是在构造方法里面定义一个对象,给这个对象赋予相应的属性、方法,最后返回这个对象

2.构造方法模式

    function CrearePerson(name,sex,age){
        this.name = name;
        this.age = sex;
        this.age = age;
        this.say = function(){
            console.log("你好！我是:" + this.name);
        };
    }
	//	构造方法,就是给当前对象指定一些属性,方法

3.构造方法 + 原型模式

    function Person(name){
		this.name = name;
	}
    Person.prototype = {
          "constructor":Person,
        //  指定原型对象的构造器
        "name":"小宋",
        "age":20,
        "job":"程序员",
        "say":function(){
            console.log("我是原型的函数");
        }
    };

在前面2种创建类的模式中，我们每次实例化一个对象都会重新声明出一些东西,对象个数少可能没什么关系,但是当对象个数达到一定数量时,就会对性能造成一定的影响。所以,就出来了第三种"构造方法 + 原型模式",构造方法的作用是为实例化出来的对象定义一些私有属性,原型的作用就是绑定一些公共属性方法,让所有实例化出来的对象都可以共,只有在第一次实例化的时候进行初始化,往后就不会再初始化了。这样,当在写大型Web程序时,性能会相对较好。

    function Person1(name,sex,age){
        var obj = {
            "name":name,
            "sex":sex,
            "age":age,
            "say":function(){
                console.log("hello world!");
            }
        };
        return obj;
    }
    //  工厂模式

    function Person2(name,sex,age){
        this.name = name;
        this.age = sex;
        this.age = age;
        this.say = function(){
            console.log("你好！我是:" + this.name);
        };
    }
    //  构造方法模式

    function Person3(name){
        this.name = name;
    }
    Person3.prototype = {
        "constructor":Person3,
        //  指定原型对象的构造器
        "name":"小宋",
        "age":20,
        "job":"程序员",
        "say":function(){
            console.log("我是原型的函数");
        }
    };
    //  构造方法 + 原型模式

    console.time("工厂模式");
    for(var i = 0; i < 10000;i ++){
        var o = new Person1("小宋","男",22);
    }
    console.timeEnd("工厂模式");

    console.time("构造方法模式");
    for(var i = 0; i < 10000;i ++){
        var o = new Person2("小宋","男",22);
    }
    console.timeEnd("构造方法模式");

    console.time("构造方法 + 原型模式");
    for(var i = 0; i < 10000;i ++){
        var o = new Person3("小宋");
    }
    console.timeEnd("构造方法 + 原型模式");
	//	三者性能在一定的循环次数下性能对比

我把上面的代码段跑了一遍,在一样的循环次数下,经过多次对比,发现"构造方法 + 原型模式"的性能是最优的,具体对比请看下图。

![性能对比](http://rwson.github.io/assets/img/posts/class-mode-conpare.png)