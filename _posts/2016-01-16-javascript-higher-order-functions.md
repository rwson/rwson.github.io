---
layout: post
title: javascript的高阶函数
date: 2016-01-16
categories: [javascript]
---

高阶函数:听到高阶感觉很高大上的一个词,但是实现起来并不是那么难。

记得有一次在看js面试题相关资料时,看到类似于下面一个题目,实现一个函数,能有如下写法,实现两个值相加并返回,写法大概是这样的:

    add(10)(5);
    
以前没见过这种写法,相信大家对下面的写法肯定不陌生:

    function add(){
        return function(a,b){
            return a + b;
        };
    }
    
    //  然后调用的时候写成下面的样子
    
    add()(10,5);
    
    //  最后返回15
    
仔细观察这两种写法,发现它们在写法上差别很小,第一种写法是一个括号里放一个参数,而第二种写法是把两个参数放在同一个括号里,既然写法类似,实现起来肯定区别也不是特别大,且看下面的实现:

    function add(a){
        return function(b){
            return a + b;
        }
    }
    
这样我们就实现了一个高阶函数。在上面两个例子中,调用add并没有立即返回一个计算后的值,而是返回了一个函数,调用该返回的函数后,才会返回具体计算后的值,这样就有了第二对括号。

再来看个例子:

    function func(p1){
        var self = this;
    
        function fd(p2) {
            this.add1 = function (p3) {
                return p1 + "," + p2 + " " + p3;
            };
        }
    
        self.add =  function (p2){
            fd.call(this, p2);
            return this.add1;
        };
        
        return self.add;
    }
    
    //  也可以直接这样实现
    function func(p1){
        return function(p2){
            return function(p3){
                return p1 + "," + p2 + " " + p3;
            }
        }
    }
    
再来个实例,解决数组元素累加的问题:

    function addArray(arr){
        var res = 0;
        if(Array.prototype.forEach){
            arr.forEach(function(item){
                res += item;
            });
            return res;
        }
        for(var i = 0,len = arr.length;i < len;i ++){
            res += arr[i];
        }
        return res;
    }
        
    function applyAdd(func,arr){
        return func.apply(func,Array.prototype.slice.call(arguments, 1));
    }
        
    console.log(applyAdd(addArray,[1,2,3,4,5,6,7,8,9]));
    
在调用applyAdd时,其实真正走的是addArray方法。

在著名的js工具库underscoreJs中,也有类似的例子,后面介绍。