---
layout: post
title: javascript实现继承
date: 2015-05-26
categories: [javascript]
---

继承:

继承是指一个对象拥有另外一个对象一些公共方法或属性。在大多数其他面向对象语言中，继承一个类只需使用一个关键字即可；但是在JS中想要达到继承公用成员的目的，需要采取一系列措施。JS属于原型式继承，得益于这种灵活性，我们既可以使用标准的基于类的继承，也可以使用更微妙一些的原型式继承。在JS中应该要明确一点，一切继承都是通过prototype来进行的，JS是基于对象来继承的，且不止一种继承方式。

第一种：

	/**
     * 父类SuperClass的构造器
     * @param name
     * @constructor
     */
	function SpuerClass(name){
		this.name = name;	
	}
	
	SuperClass.prototype = {
		"constructor":SpuerClass,
		//	修正构造器
		"getName":function(){
			return this.name;
		}
		//	父类原型对象下的getName方法
	};

	/**
     * 子类SubClass的构造器
     * @param name
     * @param age
     * @constructor
     */
	function SubClass(name,age){
		SuperClass.call(this,name);
		//	SuperClass.apply(this,[name]);
		//	继承父类构造器
	}
	
	SubClass.prototype = new SuperClass();
	//	继承父类的原型
	
	SubClass.prototype.constructor = SubClass;
	//	修正子类的构造器

	SubClass.prototype.getAge = function(){
		return this.age;
	}
	//	子类原型对象下的getAge方法

这种继承方式就是最简单的JS继承：伪造对象法。不足之处在于实例化SubClass时会调用两次父类的构造方法，且需要额外的保存原型链中实例化父类的对象，如果在属性和方法比较多的情况下，这样一来性能方面就大打折扣了，效果是达到了，但是执行速率受到了一定的影响。且耦合性较大，于是就有了下面的继承方式。

第二种：

	/**
     *
     * @param sub 子类
     * @param sup 父类
     * 实现子类对父类原型的继承
     */
    function extend(sub,sup){       
        var F = new Function();
		//  用一个空函数进行中转
        
        F.prototype = sup.prototype;
        //  空函数的原型对象和父类的原型对象转换

        sub.prototype = new F();
		//  原型继承
        
        sub.prototype.constructor = sub;
	    //  还原子类构造器

		//  指定子类构造方法
        //  保存父类的原型对象
		//  1.解耦方便,降低耦合性 2.方便获得父类的原型对象

        sub.superClass = sup.prototype;
		//  自定义子类的静态属性,接收父类的原型对象,
		//	如果子类重写了父类方法，可以通过该属性来访问
        if(sup.prototype.constructor == 
		   Object.prototype.constructor){
            sup.prototype.constructor = sup;
        }
        //  判断父类原型对象的构造器是否为父类本身
		//	如果不是,手动还原构造器
    }

	/**
     * 父类SuperClass的构造器
     * @param name
     * @constructor
     */
	function SpuerClass(name){
		this.name = name;	
	}
	
	SuperClass.prototype = {
		"constructor":SpuerClass,
		//	修正构造器
		"getName":function(){
			return this.name;
		}
		//	父类原型对象下的getName方法
	};

	/**
     * 子类SubClass的构造器
     * @param name
     * @param age
     * @constructor
     */
	function SubClass(name,age){
		SubClass.superClass.constroctur.call(this,name);
		//	继承父类的name属性
		this.age = age;
	}
	
	extend(SubClass,SuperClass);
	//	实现继承

	SubClass.prototype.getName = function(){
		return "你好," + this.name + "!";
	}
	//	子类重写了父类的getName方法

	var sub = new SubClass("小宋",22);
	console.log(sub.getName());
	//	你好,小宋

	console.log(SubClass.superClass.getName.call(sub));
	//	通过子类的静态属性来访问父类方法
	//	小宋
	
上述代码也实现了子类对父类的继承，且是现在用的比较广泛的一种(类式继承)。
个人认为这种方法的好处在于：

1、仅在实例化对象的时候调用一次父类的构造函数；   
2、且没有保存不必要的父类实例化的属性；   
3、通过superClass属性，可以很轻松的访问被子类重写的父类方法；   
4、降低耦合性。