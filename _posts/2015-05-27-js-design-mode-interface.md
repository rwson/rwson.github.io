---
layout: post
title: javaScript接口
date: 2015-05-27
categories: [技术]
---

接口:

接口是提供了一种用以说明一个对象应该具有哪些方法的手段，但它并不规定这些方法应该如何实现。在JS中，没有像其他面向对象程序语言的interface关键字，所以实现的方法也语言不同；JS实现接口的主要方式主要为定义描述法、属性检测法和鸭式辨型法，其中鸭式辨型法是目前用的最多的。

1、定义描述法

	/**
     *  interface CompsiteImpl{
     *      function add();
     *      function remove();
     *      function update();
     *  }
     */

    /**
     * 实现接口
     * @constructor
     */
    function CompsiteImpl(){
    }

    CompsiteImpl.prototype = {
        "constructor":CompsiteImpl,
        "add":function(){
            console.log("我是add方法！");
        },
        "remove":function(){
            console.log("我是remove方法！");
        },
        "update":function(){
            console.log("我是update方法！");
        }
    };

此方法也称注释法，顾名思义，就是通过一系列的注释来定义该类需要实现哪些接口方法，这是最简单定义接口的一种方法。但是此方法缺点实在太明显了，比如一个人代码写完了，他只能通过肉眼来判断是不是都把刚才注释里面的方法都实现了；他哪天代码做修改了，是否和注释一致等等的。只是属于一个类似于帮助文档的范畴，太死板。

2、属性检测法

	/**
     *  interface Compsite{
     *      function add();
     *      function remove();
     *      function update();
     *  }
     *
     *  interface FormItem{
     *      function select();
     *  }
     *
     */

    //  实现接口
    //  需要实现 Compsite FormItem
    function CompsiteImpl(){
        //  在类的内部定义一个变量
        this.implementsInterface = ["Compsite","FormItem"];
    }

    CompsiteImpl.prototype = {
        "constructor":CompsiteImpl,
        "add":function(){
            console.log("add 方法");
        },
        "remove":function(){
			console.log("remove 方法");
		},
        "update":function(){
			console.log("remove 方法");},
        "select":function(){
			console.log("select 方法");
		}
    };

    /**
     *
     * @param instance
     *
     * 检测类的方法
     */
    function checkCompsiteImpl(instance){
        //  判断当前对象是否实现了所有的接口
        if(!isImplements(instance,"Compsite","FormItem"))
		{
            throw new Error("object does not implement 
				a required interface");
        }
    }

    /**
     *
     * @param object
     *
     * 公共的、具体的检测方法(核心方法)
     */
    function isImplements(object){
        for(var i = 1,l = arguments.length;
		i < l;i ++){
            var interfaceName = arguments[i],
                interfaceFound = false;
            for(var j = 0,
				len = object.implementsInterface.length;
			j < len;j ++)
			{
                if(object.implementsInterface[j] ==
			 interfaceName){
                    interfaceFound = true;
                }
            }
            if(!interfaceFound){
                return false;
            }
            return true;
        }
    }

    var c1 = new CompsiteImpl();
    checkCompsiteImpl(c1);
    c1.add();

这种方法相对来说高级一点了，如果有一个接口没有没实现，会看到一个错误，代码不往下继续走了。但缺点在于仍无法判断是否真正实现了对应的接口方法，仅仅只是"自称"实现了接口，同时这种方法耦合性也比较高，放到另外一个地方可能就需要进行修改才能复用。

3、鸭式辨型法

	/**
     *
     * @param name      接口名,字符串
     * @param methods   需要实现的方法,接收方法的集合、数组
     * @constructor
     * 接口类
     */
    function Interface(name,methods){
        //  判断接口的参数个数
        if(arguments.length != 2){
            throw new Error("this instance interface 
			constructor required 2 arguments!");
        }
        this.name = name;
        this.methods = [];
        //  定义一个空数组,等待接收methods里面的方法名
        for(var i = 0,len = methods.length; i < len; i ++){
            if(typeof methods[i] !== "string"){
                throw new Error("the Instance method name
				 is error!");
            }
            this.methods.push(methods[i]);
        }
    }

    /**
     *
     * @param object
     *
     * 检验方法,如果通过,不做任何操作,否则抛出异常
     */
    Interface.ensureImplement = function(object){
        //  至少得实现一个接口
        if(arguments.length < 2){
            throw new Error("Interface.ensureImplement 
		constructor arguments must be 2 
			or more arguments!");
        }
        //  获得接口实例对象
        for(var i = 1,len = arguments.length;
		i < len;i ++){
            var instanceInterface = arguments[i];
            //  判断参数是否为接口类的
            if(!(instanceInterface instanceof Interface))
			{
                throw new Error("the arguments" + 
				instanceInterface + "is 
				not an instance of Interface Class");
            }
            //  循环接口实例对象里面的每个方法
            for(var j = 0,l = instanceInterface.methods.length;
			 j < l;j ++){
                var methodName = 
				instanceInterface.methods[j];
                //  接收每个方法的名字(字符串)
                if(!arguments[0][methodName] || 
		typeof arguments[0][methodName] !== "function")
		{
                    throw new Error("the method "+ 
					methodName +" is not found");
                }
                //  不存在或者不是方法类型
            }
        }
    };

    //  实例化接口对象
    var CompsiteInterface = new Interface("CompsiteInterface",
	["add","remove"]),
    FormInteInterface = new 
	Interface("FormInteInterface",
	["update","select"]);

    /**
     *
     * @constructor
     * 接口类
     */
    function CompsiteImpl(){
    }
    //  实现接口
    CompsiteImpl.prototype = {
        "constructor":CompsiteImpl,
        add:function(){
            console.log("add 方法");
        },
        remove:function(){},
        update:function(){},
        select:function(){}
    };

    //  检验接口里的方法
    var c1 = new CompsiteImpl
	(c1,CompsiteInterface,FormInteInterface);

    Interface.ensureImplement
	(c1,CompsiteInterface,FormInteInterface);

    c1.add();

此方法就是目前最经典的一种方法，从上面的代码中可以看出，在这里完全采用的是面向对象的方法，通过实例化两个接口对象来声明需要实现的方法，最后实例化我们真正需要需要实例化的对象c1,通过Interface下的静态方法来判断是否已经实现全部接口，如果有一个没被实现则会看到具体是哪个没被实现，并且终止代码的继续运行，且耦合度较低。

接口的好处主要是提高了系统相似模块的重用性，使得不同类的通信更加稳固。一旦实现接口，则必须实现接口中所有的方法。在大型系统中，接口的益处是显而易见的，但是如果在一个小的web系统中使用接口就显得画蛇添足了。
