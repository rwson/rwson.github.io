---
layout: post
title: javascript组合模式
date: 2015-06-09
categories: [javascript]
---

组合模式:

在组合模式中，对象有两种形式，一种是叶子对象，一种是组合对象，其中组合对象是叶子对象的组成，有时候我们需要通过简单的控制来完成工作，组合模式就派上了用场。

下面我们模拟一个场景，模拟公司内部的一个，上级(组合对象)只要交代给部门领导(组合对象)，再由部门领导交付具体的指令给具体的员工(叶子对象)来完成具体的工作。


先来看看传统的做法：

    /**
      *
      * 公司类
      **/
    function Org(name){
        this.name = name;
        this.depts = [];
    }
    Org.prototype = {
        "constructor":Org,
        "addDepts":function(child){
            this.depts.push(child);
            return this;
            //  添加部门,return this 提供链式调用
        },
        "getDepts":function(){
            return this.depts;
            //  获取部门
        }
    };

    /**
      *
      * 部门类
      **/
    function Dept(name){
        this.name = name;
        this.persons = [];
    }
    Dept.prototype = {
        "constructor":Dept,
        "addPersons":function(child){
            this.persons.push(child);
            return this;
            //  添加部门员工
        },
        "getPersons":function(){
            return this.persons;
            //  获取部门员工
        }
    };

    /**
      *
      * 员工类
      **/
    function Person(name){
        this.name = name;
    }
    commonUtil.wrap(Person.prototype,{
        "constructor":Person,
        "hardWorking":function(){
            console.log(this.name + " ... 努力工作！");
            //  xxx ... 努力工作
        },
        "sleeping":function(){
            console.log(this.name + "睡觉！");
            //  xxx 睡觉！
        }
    });

    var p1 = new Person("张1"),
        p2 = new Person("张2"),
        p3 = new Person("张3"),
        p4 = new Person("张4"),
        p5 = new Person("张5"),
        p6 = new Person("张6"),
        dept1 = new Dept("开发"),
        dept2 = new Dept("销售"),
        org = new Org("某某公司");
    //  实例化对象    

    dept1.addPersons(p1).addPersons(p2).addPersons(p3);
    dept2.addPersons(p4).addPersons(p5).addPersons(p6);
    org.addDepts(dept1).addDepts(dept2);
    //  添加部门和部门员工
    
    for(var i = 0,depts = org.getDepts();i < depts.length;i ++){
        for(j = 0,persons = depts[i].getPersons();j < persons.length;j ++){
            if(persons[j]["name"] === "张3"){
                persons[j].hardWorking();
            }
        }
    }
    //  具体的让张3努力工作
    
在上面的例子我们可以看到,如果想要"张三"这个人执行hardWorking方法，需要写两层循环，现在只是两层结构，要是在多层的情况下，可能就需要递归神马了，甚是麻烦。

再来看看组合模式吧！这边的commomUtil下的方法和工厂模式里面的用的一样的。

    var CompositeInterface = new commonUtil.Interface("CompositeInterface",["addChild","getChild"]),
    LeafInterface = new commonUtil.Interface("LeafInterface",["hardWorking","sleeping"]);
            //  定义组合对象和叶子对象需要实现的接口
            
    /**
     * 组合对象
     * @param name
     * @constructor
     */
    function Composite(name){
        this.name = name;
        this.type = "Composite";
        //  说明当前对象类型
        this.children = [];
        //  承装孩子（叶子节点）的数组
    }
    commonUtil.wrap(Composite.prototype,{
        "constructor":Composite,
        "addChild":function(child){
            this.children.push(child);
            return this;
        },
        "getChild":function(name){
            var list = [],
                pushLeaf = function(item){
                    if(this.name === name || item["type"] === "Composite"){
                          item["children"].each(arguments.callee);
                         // pushLeaf(item["children"]);
                    }else if(item["type"] === "Leaf") {
                        list.push(item);
                    }
                };
            if(name && this.name !== name){
                //  返回指定类型的叶子对象
                this.children.each(function(item){
                    if(item["name"] === name && item["type"] === "Composite"){
                        item["children"].each(pushLeaf);
                    }
                    //  二级节点
                    if(item["name"] !== name && item["type"] === "Composite"){
                        item["children"].each(arguments.callee);
                    }
                    //  三级、四级...
                    if(item["name"] === name && item["type"] === "Leaf"){
                        list.push(item);
                    }
                });
            }else{
                //  返回所有叶子对象
                this.children.each(pushLeaf);
            }
            return list;
        },
        "hardWorking":function(name){
            var leafObjects = this.getChild(name);
            //  得到所有的叶子类型对象
            for(var i = 0,l = leafObjects.length;i < l;i ++){
                leafObjects[i] && leafObjects[i].hardWorking(leafObjects[i]["name"]);
            }
        },
        "sleeping":function(name){
            var leafObjects = this.getChild(name);
            //  得到所有的叶子类型对象
            for(var i = 0,l = leafObjects.length;i < l;i ++){
                leafObjects[i].sleeping(leafObjects[i]["name"]);
            }
        }
    });
        
    /**
     * 叶子对象
     * @param name
     * @constructor
     */
    function Leaf(name){
        this.name = name;
        this.type = "Leaf";
        //  说明当前对象类型
    }
    commonUtil.wrap(Leaf.prototype,{
        "constructor":Leaf,
        "addChild":function(child){
            throw new Error("this method is disabled");
            //  叶子节点下没有添加子节点的方法,所以调用的时候抛异常
        },
        "getChild":function(name){
            if(this.name === name){
                return this;
            }
            return null;
        },
        "hardWorking":function(){
            console.log(this.name + " ... 努力工作！");
        },
        "sleeping":function(name){
            console.log(this.name + " ... 睡觉！");
        }
    });
    
    var p1 = new Leaf("张1"),
        p2 = new Leaf("张2"),
        p3 = new Leaf("张3"),
        p4 = new Leaf("张4"),
        p5 = new Leaf("张5"),
        p6 = new Leaf("张6"),
        p7 = new Leaf("张7"),
        p8 = new Leaf("张8"),
        p9 = new Leaf("张9"),
        p10 = new Leaf("张10"),
        p11 = new Leaf("张11"),
        p12 = new Leaf("张12"),
        dept1 = new Composite("南京开发部"),
        dept2 = new Composite("南京销售部"),
        dept3 = new Composite("杭州开发部"),
        dept4 = new Composite("杭州销售部"),
        org = new Composite("xx公司"),
        org2 = new Composite("南京分公司"),
        org3 = new Composite("杭州分公司");
        //  实例化一些对象

        dept1.addChild(p1).addChild(p2).addChild(p3);
        dept2.addChild(p4).addChild(p5).addChild(p6);
        dept3.addChild(p7).addChild(p8).addChild(p9);
        dept4.addChild(p10).addChild(p11).addChild(p12);
        //  组装二级、三级、叶子节点

        org2.addChild(dept1).addChild(dept2);
        org3.addChild(dept3).addChild(dept4);
        org.addChild(org2).addChild(org3);
        //  组装分公司和总公司

        org.hardWorking();  
        //  总公司下面的人都执行hardWork方法
        org.hardWorking("南京分公司");  
        //  南京分公司下面的人都执行hardWork方法
        org.hardWorking("杭州开发部");  
        //  某级子节点(组合对象)下面的人都执行hardWork方法
        org.hardWorking("张12");  
        //  具体某人执行hardWork方法
        
怎么样,看完这个例子是不是感觉比传统的调用方法简单多了,现在就2种类型的对象,虽然组合对象下封装的方法,只要传入具体的某个部门或者员工就能走它下面的方法;这么好的模式,何乐而不为？