---
layout: post
title: javaScript实现继承之2
date: 2015-03-10
categories: [技术]
---

在前面的一篇文章[JavaScript实现继承](http://rwson.github.io/%E6%8A%80%E6%9C%AF/2015/05/26/js-object-extend.html)介绍过js中通过原型来继承的两种方法

1. 伪造对象继承:通过把父类的实例赋值给子类的prototype，然后在子类的构造函数中调用父类的构造方法；
2. 类式继承(原型式继承):通过一个空函数中转，把父类的示例赋值给该空函数的原型，然后再把该空函数的prototype赋值给子类的prototype，再在子类的构造方法中调用父类的构造器，实现继承。

综合上面两个方法，其实都通过两次调用父类的构造器来实现，第二种方法相对于第一种只是在子类原型上少了些父类的实例属性。

在《javaScript高级程序》中，介绍了另外一种继承的实现方式，名为"寄生式组合继承"。所谓的寄生式组合继承，不必为了子类的原型而调用超类型的构造函数，要实现继承只需要父类原型的一个副本。下面的具体的代码:

    /**
     * 寄生式组合继承
     * @param subType   子类
     * @param superType 父类
     **/
    function inheritPrototype(subType,subperType){
        var prototype = Object(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }
    
    /**
     * 父类
     * @param name   name属性
     **/
    function superClass(name) {
        this.name = name;
    }
    
    superClass.prototype.sayName = function() {
        alert(this.name);    
    };
    
    /**
     * 子类
     * @param name   name属性
     * @param age    age属性
     **/
    function subClass(name,age) {
        superClass.call(this,name);
        this.age = age;
    }
    
    //  实现继承
    inheritPrototype(subClass,superClass);

这样就只调用了一次父类的构造方法，在性能上更优秀。