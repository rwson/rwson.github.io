---
layout: post
title: 实现模块化编程
date: 2016-03-24
categories: [javascript]
---

先上个小例子(工资计算器):

- 传统



    //  绩效奖金
    function performanceCoefficient(salary) {
        return salary * 0.2;
    }
    
    //  住房公积金
    function companyReserve(salary) {
        return salary * 0.2;
    }
    
    //  个人所得税、五险一金
    function incomeTax(remain) {
        return (remain - 3500) * 0.2;
    }
    
    //  基本工资
    var salary = 10000;
    
    //  最后税前工资
    var finalSalary = salary + performanceCoefficient(salary);
    
    finalSalary = finalSalary - incomeTax(finalSalary - companyReserve(finalSalary));
    
    console.log(finalSalary);
    
- 类模块化
    

    //  全局变量,存储已经声明的模块
    var modules = {};
    
    //  先来实现几个工具函数
    var define = (function() {
    
    //  根据depArrs中的模块名称找出modules中的相关对象
    var _require = function(depArrs) {
        return depArrs.map(function(dep) {
            return modules[dep];
        });
    };

        //  define函数实际做的事情
        return function(id, depArrs, factory) {
        
            //  判断是否已经声明过同名模块
            deps.map(function(dep) {
                return dep.factory.apply(window, dep.deps);
            });
    
            var deps = _require(depArrs);
            if (modules[id]) {
                throw new Error("module " + id + " has been declared!");
            }
            modules[id] = {
                id: id,
                factory: factory,
                deps: deps
            };
        };
    })();

    //  实现一个调用主入口文件,只需传入模块id即可
    //  类似于sea中的sea.use("id", [], function(){ /*...*/ })
    //  或者requirejs中的require(["id"])
    var loader = function(id) {
        if (!modules[id]) {
            throw new Error("module" + id + " has not been declared!");
        }
        var deps = modules[id].deps;
        deps = deps.map(function(dep) {
            return dep.factory.apply(window, dep.deps);
        });
        modules[id].factory.apply(window, deps);
    };

    //  声明一个计算模块
    define("calc", [], function() {
        return {
            performanceCoefficient: function(salary) {
                return salary * 0.2;
            },
            companyReserve: function(salary) {
                return salary * 0.2;
            },
            incomeTax: function(remain) {
                return (remain - 3500) * 0.2;
            }
        };
    });
    
    //  最终用来计算工资的模块
    define("salary",["calc"], function(calc) {
        var slary = 10000000,
            finalSalary = slary + calc.performanceCoefficient(slary);
            
        finalSalary = finalSalary - calc.incomeTax(finalSalary - calc.companyReserve(finalSalary));
        
        console.log(finalSalary);
        
    });
    
    loader("salary");
    
上面两段代码都完成了相同的功能,但是在写法上差别很大,称第二种方式是类模块化的原因是现在的代码还没有完全实现模块化,所有的模块都在同一文件,没有实现完全解耦,这时就需要加载器(require)来帮我们完成各功能模块分文件的目的,模块化的优势不言而喻,后面介绍一步步实现一个符合AMD规范的加载器。