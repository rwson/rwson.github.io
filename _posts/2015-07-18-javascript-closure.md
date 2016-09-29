---
layout: post
title: javascript闭包
date: 2015-07-10
categories: [javascript]
---

本文讨论的javascript不包含ES6标准。

javascript在作用域和其他大多数语言不同, 没有局部变量的的概念,一个变量的作用范围就是它所在的函数,且没有块级作用域的概念。

我们可以通过下面的代码理解下上面的话:

    var variable1 = 1;

    function A() {
        console.log(variable1);
        
        if(true) {
            var variable2 = "variable2";
        }
        
        console.log(variable2);
    }
    
    A();
    //  最终打印出1和variable2这个字符串


可能类似的代码放到其他语言中,我们在if外面访问variable2时,就会报错,但在javascript中不会。

刚才说"一个变量的作用范围就是它所在的函数",可以通过下面的代码验证下:

    function A() {
        var variable1 = "variable1";
    }
    
    A();
    
    console.log(variable1);
    //  Uncaught ReferenceError: variable1 is not defined

此时在函数外部就无法访问函数内定义的变量。

但是如果不用var关键字的话,情况就不一样了

    function A() {
        variable1 = "variable1";
    }
    
    A();
    
    console.log(variable1);
    //  最终打印出variable1这个字符串

因为不用var的话,就相当于声明了一个全局变量。

但是有时候,我们就是想读取函数内部变量,该怎么做呢?可以像下面这样:


    function A() {
        
        var variable1 = "variable1";
        
        return function() {
            console.log(variable1);
        };
    
    }
    
    A()();
    
这边调用了两对圆括号,第一对是取得A返回的匿名函数,第二对是执行该匿名函数。

上面就是一个典型的闭包例子,用阮一峰大神的话说"闭包就是能够读取其他函数内部变量的函数"。

在实际开发中,我们会在很多地方用到闭包,就是用到两个比较重要的作用:

- 使某些变量常驻内存,且不与函数外部变量冲突
- 子函数访问父函数的内容

在很多著名类库/框架源码中,可能经常会看到类似的代码:

    (function(root, undefined) {
        
        var var1 = xxx;
        var var2 = yyy;
        //  ...
        
        function zzz() {
            //  ...
        }
        
        root.zzz = zzz;
        
    })(window);

就充分利用了第一条特性。

第二条就是我们在前面的代码中有例子,就不做过多阐述。

我们都知道javascript中没有类的概念,我们只能通过函数类模拟类,通过原型来实现继承,但是有时候有些成员属性是不能继承的或者不希望被外部直接访问到, 所以需要一些私有成员属性。

下面我们模拟一个类,里面有私有成员属性:
    
    //  实现一个"人"类
    function Person(name, age) {
        
        //  模拟私有成员属性
        var _salary;
        var _wife;
        
        //  getter/setter
        this.salaryGetter = function() {
            return _salary;
        };
        
        this.salarySetter = function(salary) {
            _salary = salary;
        };
        
        this.wifeGetter = function() {
            return _wife;
        };
        
        this.wifeSetter = function(wife) {
            _wife = wife;
        };
        
        this.name = name;
        this.age = age;
        
    }
    
    Person.prototype = {
        
        constructor: Person,
        
        eat: function() {
            console.log("吃饭");
        },
        
        sleep: function() {
            console.log("睡觉");
        }
        
        //  ...
    
    };
    
    function SubPerson(name, age) {
        
        //  构造器继承
        Person.call(this,name,age);
        
    }
    
    SubPerson.prototype = new Person();
    
    
    SubPerson.prototype.constructor = SubPerson;
    
    //  overwrite methods
    
    var person = new SubPerson("小宋", 23);

    console.log(person);
    
上面我们就完成了一个简单的继承和私有成员属性的模拟。

关于闭包的应用例子还有很多,后面介绍。
