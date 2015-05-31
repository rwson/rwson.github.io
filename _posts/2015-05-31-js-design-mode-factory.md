---
layout: post
title: javaScript工厂模式
date: 2015-05-27
categories: [技术]
---

工厂模式:

创建一个对象常常需要复杂的过程，所以不适合在一个复杂的对象中。创建对象可能会导致大量的重复代码，也可能提供不了足够级别的抽象。工厂方法模式通过定义一个单独的创建对象的方法来解决这些问题，由子类实现这个方法来创建具体类型的对象。

简单工厂：
类本身实现了所有功能代码，通过实例化调用其方法来完成某些功能。

抽象工厂：
类本身定一些抽象方法，通过给子类继承的方式，来重写父类的抽象方法，该类不能被实例化，只能通过实例化它的子类来完成某些功能。

        /**
         * 注：
         * commonUtil.wrap(xxx.prototype,{})和xxx.prototype = {}功能相同
         * commonUtil.extend()是实现继承那边类式继承的代码功能
         * commonUtil.Interface和commonUtil.Interface.ensureImplement是实现接口那边鸭式辨型的代码功能
         *
         * */
         
----------

这是简单工厂的一个示例：

	/*
		功能描述：
		有三种类型的车(奔驰,宝马,奥迪),现在要买车,定义一个汽车4店类卖车
		逻辑流程：
		
	*/

	/**
	  * 汽车商店构造器
	  * @constructor
	  */
	function CarShop() {}

        commonUtil.wrap(CarShop.prototype, {
            "constructor": CarShop,
            "sellCar": function (type) {
                var car;
                switch (type) {
                    case "Benz":
                        car = new Benz();
                        break;
                    case "Bmw":
                        car = new Bmw();
                        break;
                    case "Audi":
                        car = new Audi();
                        break;
                    default:
                        "not to buy!"
                }
		//	通过传入的参数判断到底要实例哪个牌子的车对象(造车)
                return car;
            }
        });
        //  拓展原型对象

        /**
         * SuperClass
         * @constructor
         */
        function BaseCar(){}

        commonUtil.wrap(BaseCar.prototype,{
            "start": function () {
                console.log("我的"+ this.constructor.name +"启动了！");
            },
            "run": function () {
                console.log("我的"+ this.constructor.name +"开走了！");
            }
        });

        //  Class benz bmw audi
        //  子类应该先继承BaseCar类,再拓展或重写自己的方法
	 	//	奔驰	
        function Benz() {
        }
        commonUtil.extend(Benz,BaseCar);

		//	宝马
        function Bmw() {
        }
        commonUtil.extend(Bmw,BaseCar);

		//	奥迪
        function Audi() {
        }
        commonUtil.extend(Audi,BaseCar);
        //  三个子类分别继承父类

        var shop = new CarShop();
	 	//	实例化汽车商店
        var car = shop.sellCar("Bmw");
		//	从商店里买走辆宝马
        car.start();
        car.run();

        var car2 = shop.sellCar("Audi");
		//	从商店买走一辆奥迪
        car2.start();
        car2.run();

从上面的例子中可以看到，在CarShop这个类中，把所有工作都做了，但是在实际生活中，汽车4S店负责的就只有卖车等工作，不会和现在这个例子一样把生产车的例子也做了，而且在这个例子中，该汽车4S店提供了3种品牌的车(本初、宝马、奥迪)，根据需求决定具体出哪一种车。所以，我们有必要把代码优化下，让汽车店只负责卖车。其他的工作和它没太大关系，于是，就有了抽象工厂的概念。

        var CarInterface = new commonUtil.Interface("CarInterface", ["start", "run"]);
        //  接口对象的实例

		/**
         * 卖车的商店(抽象类)
         * 抽象类 -> 用来被之类继承
         * @constructor
         * */
        function CarShop() {
        }

        commonUtil.wrap(CarShop.prototype, {
            "constructor": CarShop,
            "sellCar": function (type) {
                throw new Error("method sellCar is an abstruct method!");
            }//	卖车，给子类继承重写
        });
        //  拓展原型对象

        //  奔驰4S店类
        function BenzCarShop(){}
        commonUtil.extend(BenzCarShop,CarShop);
        commonUtil.wrap(BenzCarShop.prototype,{
            "constructor":BenzCarShop,
            "sellCar":function(type){
                var car;
                var types = ["Benz"];
                for(var t in types){
                    if(types[t] === type){
                        //  如果商店里有想要的型号,就走这边
                        car = CarFactory.createCar(type);
                    }else{
                        //  没有此类型的车
                        console.log("没有此型号！");
                    }
                }
                return car;
                //  数组中存放所有奔驰类型的汽车
            }
        });

        //  宝马4S店类
        function BmwCarShop(){}
        commonUtil.extend(BmwCarShop,CarShop);
        commonUtil.wrap(BmwCarShop.prototype,{
            "constructor":BmwCarShop,
            "sellCar":function(type){
                var car;
                var types = ["Bmw"];
                for(var t in types){
                    if(types[t] === type){
                        //  如果商店里有想要的型号,就走这边
                        car = CarFactory.createCar(type);
                    }else{
                        //  没有此类型的车
                        console.log("没有此型号！");
                    }
                }
                return car;
            }
        });

 	//  奥迪4S店类
        function AudiCarShop(){}
        commonUtil.extend(AudiCarShop,CarShop);
        commonUtil.wrap(BmwCarShop.prototype,{
            "constructor":AudiCarShop,
            "sellCar":function(type){
                var car;
                var types = ["Audi"];
                for(var t in types){
                    if(types[t] === type){
                        //  如果商店里有想要的型号,就走这边
                        car = CarFactory.createCar(type);
                    }else{
                        //  没有此类型的车
                        console.log("没有此型号！");
                    }
                }
                return car;
            }
        });
	 	//	创建3个汽车4S店类，分别完成对汽车店类的继承

        var CarFactory = {
            "createCar":function(type){
                var car;
                //  动态创建车
                car = eval("new "+ type +"();");
                //  利用eval动态创建传入的车实例
                commonUtil.Interface.ensureImplement(car,CarInterface);
                //  检验接口是否实现
                return car;
            }
        };
        //  创建生产一台车的工厂(单体模式)

        /**
         * SuperClass
         * @constructor
         */
        function BaseCar(){}

        commonUtil.wrap(BaseCar.prototype,{
            "start": function () {
                console.log("老子的"+ this.constructor.name +"启动了！");
            },
            "run": function () {
                console.log("老子的"+ this.constructor.name +"开走了！");
            }
        });

        //  Class benz bmw audi
        //  子类应该先继承父类,再拓展或重写自己的方法

        function Benz() {
        }
        commonUtil.extend(Benz,BaseCar);

        function Bmw() {
        }
        commonUtil.extend(Bmw,BaseCar);
        commonUtil.wrap(Bmw.prototype,{
            "driveBmw":function(){
                console.log("开宝马！");
            },
            "run":function(){
                console.log("宝马开走了！");
            }
        });

        function Audi() {
        }
        commonUtil.extend(Audi,BaseCar);
        //  三个子类分别继承父类,并且拓展自己的方法

        var benz = new BenzCarShop(),
            bmw = new BmwCarShop(),
            benzCar = benz.sellCar("Benz"),
            bmwCar = bmw.sellCar("Bmw");
		//去具体的某个4S店卖车

        benzCar.run();
        bmwCar.run();	

在上面的抽象工厂中，汽车类之提供了一个抽象方法，给各子类继承和重写，而生产的工作交给了具体某种汽车厂商的造车厂，卖车的工作细分到具体某种品牌的4S店，这样，才是我们日常生活中的正常逻辑(买什么车,去什么4S店 -> 卖车 -> 生产车 -> 买车)。

