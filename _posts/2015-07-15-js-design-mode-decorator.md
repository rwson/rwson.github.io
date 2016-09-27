---
layout: post
title: javascript装饰者模式
date: 2015-07-15
categories: [javascript]
---

js装饰者模式可以把一个对象(类/函数)透明地包装在另外一个对象上,完成对被装饰者添加一些新功能的作用。

装饰者模式的特点:
- 不修改原对象的原本结构来进行功能添加;
- 装饰对象和原对象具有相同的接口，可以使客户以与原对象相同的方式使用装饰对象;
- 装饰对象中包含原对象的引用，即装饰对象为真正的原对象在此包装的对象。


先看个小例子:

        function getDate(){
        var date = new Date();
        return date.toString();
    }
    function toUpperCaseDecorator(fn){
        return (function(f){
            return f.apply(this,arguments).toUpperCase();
        })(fn);
    }
    console.log(getDate());
    //  Thu Jun 25 2015 23:05:04 GMT+0800 (CST)
    console.log(toUpperCaseDecorator(getDate));
    //  THU JUN 25 2015 23:05:04 GMT+0800 (CST)
        
在上面的例子中,getDate作为一个被装饰者(完成获取当前时间的字符串形式),toUpperCaseDecorator作为一个装饰者,在原来的基础上把原来的小写字母改成了大小,在这里就相当于添加了一个新功能。

下面我们就还是拿汽车来模拟一个具体的场景:

需求:现在要造一辆车,既然是车嘛,肯定有很多的零部件,这里就拿车载冰箱和车灯来说吧;比如我的车主结构20000元,车载冰箱10000元,车灯10000元,那我肯定在组装的时候就把价格给它加上去,来看具体的代码。

        var CarInterface = new commonUtil.Interface("CarInterface",["getPrice","assenble"]);
        //  定义
        function Car(car){
            this.car = car;
            //  为了让子类继承(让子类多一个父类的引用)
            commonUtil.Interface.ensureImplement(this,CarInterface);
            //  检测接口
        }
        commonUtil.wrap(Car.prototype,{
            "constructor":Car,
            "getPrice":function(){
                return 200000;
            },
            "assenble":function(){
                console.log("组装汽车");
            }
        });
        //  新需求:加上light,icebox
        function lightDecorator(car){
            //  参数car代表原始对象
            lightDecorator.superClass.constructor.call(this,car);
            //  构造方法继承
            //  this.car = car;
            //  为了让子类继承(让子类多一个父类的引用)
            //  commonUtil.ensureImplement(this,CarInterface);
            //  检测接口
        }
        commonUtil.extend(lightDecorator,Car);
        //  继承
        commonUtil.wrap(lightDecorator.prototype,{
            "constructor":lightDecorator,
            "getPrice":function(){
                return this.car.getPrice() + 10000;
            },
            "assenble":function(){
                console.log("组装车灯");
            }
        });
        //  重写父类的方法会影响继承过来的方法
        function iceBoxDecorator(car){
            //  参数car代表原始对象
            iceBoxDecorator.superClass.constructor.call(this,car);
            //  构造方法继承
            //  this.car = car;
            //  为了让子类继承(让子类多一个父类的引用)
            //  commonUtil.ensureImplement(this,CarInterface);
            //  检测接口
        }
        commonUtil.extend(iceBoxDecorator,Car);
        //  继承
        commonUtil.wrap(iceBoxDecorator.prototype,{
            "constructor":iceBoxDecorator,
            "getPrice":function(){
                return this.car.getPrice() + 20000;
            },
            "assenble":function(){
                console.log("组装冰箱");
            }
        });
        var car = new Car();
        console.log(car.getPrice());
        car.assenble();
        car = new lightDecorator(car);
        //  在原来的基础上装上车灯
        console.log(car.getPrice());
        car = new iceBoxDecorator(car);
        //  在原来的基础上装上车载冰箱
        console.log(car.getPrice());
        
通过上面的代码,我们的车就由原来的车框架,给它装上了车载冰箱和车灯,同时又没有修改原来车这个类的代码而拓展了它的功能。实现方式就是定义一个父类Car,提供一些原型方法,然后再定义子类来继承车这个类,并对父类的方法进行重写。
