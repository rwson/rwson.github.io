---
layout: post
title: javaScript原型
date: 2015-05-23
categories: [技术]
---

javaScript原型:

定义：每一个方法被创建时都有一个prototype属性,改属性是一个指针,总是指向一个对象。该对象可以将特定的属性和方法包含在内,起到一个被所有实例所共享的作用。

	    function Person(){
	
	    }
	
	    var obj  = Person.prototype;
		    obj.name = "小宋";
		    obj.age = 20;
		    obj.sayName = function(){
		        console.log(this.name);
		    };
	    //	定义一个变量来引用原型,修改这个变量的属性达到修改原型的目的


原型对象、构造方法、实例对象三者的关系

1、构造方法.prototype = 原型对象

2、原型对象的constructor = 构造方法

3、实例对象.prototype = 原型对象

原型中的常用方法

1、isPrototypeOf	  (判断一个对象是不是另一个对象的原型)
示例:
	
    function Person(){}
    var obj  = Person.prototype;
        obj.name = "小宋";
        obj.age = 20;
        obj.sayName = function(){
            console.log(this.name);
        };
    var p = new Person();
    console.log(obj.isPrototypeOf(p1));		//	true

2、Object.getPrototypeOf		(根据实例对象获取原型对象)
示例:
	
    function Person(){}
    Person.prototype.name = "张三";
    Person.prototype.age = 20;
    Person.prototype.sayName = function(){
        console.log("原型方法!");
    };
    var p1 = new Person();
    console.log(Object.getPrototypeOf(p1));	//	Person的原型对象

3、hasOwnProperty	(判断一个对象的属性是属于原型属性或者实例属性)
示例:
	
    function Person(){}
        Person.prototype.name = "张三";
        Person.prototype.age = 20;
        Person.prototype.sayName = function(){
            console.log("原型方法!");
        };
    var p1 = new Person();
    p1.name = "小宋";
    console.log(p1.hasOwnProperty("name"));	//	true

4、in操作符	(判断属性是否存在实例对象或原型对象中,类似于hasOwnProperty)
示例:
	
    function Person(){}
        Person.prototype.name = "张三";
        Person.prototype.age = 20;
        Person.prototype.sayName = function(){
            console.log("原型方法!");
        };
    var p1 = new Person();
    p1.name = "小宋";
    console.log("name" in p1);	//	true

5、Object.keys()	(取得当前对象下中所有键值,返回一个数组)
示例:

    function Person(){}
        Person.prototype.name = "张三";
        Person.prototype.age = 20;
        Person.prototype.sayName = function(){
            console.log("原型方法!");
        };
    var p7 = new Person();
    console.log(Object.keys(p7));	//	[]
    p7.name = "z3";
    p7.age = 20;
    console.log(Object.keys(p7));	//	["name", "age"]
    console.log(Object.keys(Person.prototype));	//	["name", "age", "sayName"]

6、Object.getOwnPropertyNames()	(枚举出该对象下所有属性,不管该属性是否可以被枚举,返回数组)
在ECMAScript中,对象原型下的constructor属性是不能被枚举的(for in),但是用Object.getOwnPropertyNames()方法可以把对象原型下所有属性都枚举出来,以数组的形式返回
示例:

    function Person(){}
        Person.prototype.name = "张三";
        Person.prototype.age = 20;
        Person.prototype.sayName = function(){
            console.log("原型方法!");
        };
    console.log(Object.getOwnPropertyNames(Person.prototype)); 	//	["constructor", "name", "age", "sayName"]

在平常的javaScript面向对象中,如果我们类的原型中没指定构造器,那么该构造器会默认为Object;
在ECMAScript5中,提供了给原型对象重新设置构造器的方法:Object.defineProperty();
ECMAScript5兼容性: IE8+,FireFox4+
下面我们就一起来看怎么调用该方法:

    function Person(){}
    Person.prototype = {
        "name":"小宋",
        "age":20,
        "job":"程序员",
        "say":function(){
            console.log("我是原型的函数");
        }
    };
    Object.defineProperty(Person.prototype,"constructor",{
        "enumerable":false,
	   //	关闭枚举访问,默认为关闭状态(for in的时候不能读到该属性)
        "value":Person
	  //	指定原型构造器
    });

    var p1 = new Person();

    var str = "";
        for(var attr in p1){
            str += attr + "->" + p1[attr] + "\n";
        }
    console.log(str);
    /**
      *    name->小宋
      *    age->20
      *    job->程序员
      *    say->function (){
      *                console.log("我是原型的函数");
      *    }
    **/

或者我们可以直接通过设置类原型属性的方法来指定构造器

    function Person(){}
    Person.prototype = {
        "constructor":Person,
        //  指定原型构造器,这边指定的是可以被枚举的
        "name":"小宋",
        "age":20,
        "job":"程序员",
        "say":function(){
            console.log("我是原型的函数");
        }
    };

    var p1 = new Person();

    var str = "";
    for(var attr in p1){
        str += attr + "->" + p1[attr] + "\n";
    }
    console.log(str);
    /**
      *    constructor->function Person(){
      *
      *    }
      *    name->小宋
      *    age->20
      *    job->程序员
      *    say->function (){
      *                console.log("我是原型的函数");
      *    }
    **/