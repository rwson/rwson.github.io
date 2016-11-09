---
layout: post
title: javascript中arguments对象
date: 2015-03-07
categories: [javascript,arguments]
---

arguments对象    
定义：   
arguments是传进实参的集合,可理解为数组类型,但是又不是数组类型   
常用属性arguments.callee,该属性像一个指针,指向函数自己,但是该属性在严格模式下被禁用了,意味着在严格模式下无法在匿名函数内部调用自身。

在js中,允许函数的实参和形参个数不同,即使这样,在函数运行时也不会报错,看下面的例子：

	function test(a,b,c,d){
        return a + b + c + d;
    }

	console.log(test(1,2,3,4,5));
	//	打印出10,因为接收到的参数为(1,2,3,4)
	console.log(test(1,2,3));
	//	打印出NaN,因为接收到的参数为(1,2,3,undefuned)

所以,为了避免上面的情况,我们有必要在函数运行之前对函数的实参和形参个数是否相等进行判断,这里就可以用到我们的arguments对象。

首先我们取得函数形参个数,有两种方法(函数名.length/arguments.callee.length),然后我们可以取得函数的实参个数,具体为arguments.length。下面用一个累加实现一下对函数实参和形参个数的验证,如果两种不相等,则抛出异常;如果验证通过,则执行正确的函数体。

	function test1(a,b,c,d){
        if(arguments.callee.length !== arguments.length){
        //	前者也可写为test1.length,不过建议写为arguments.callee.length,具体原因下文解释
            throw "参数个数不正确!";
        }else{
            return function(a){
                var res = 0;
                for(var i = 0;i < a.length;i ++){
                    res += a[i];
                }
                return res;
            }(arguments);
		//	验证通过,执行函数体
        }
    }

	console.log(test1(1,2));
	//	抛出"参数个数不正确！"的异常
	console.log(test1(1,2,3,4));
	//	验证通过,打印出10


在实际js中,arguments对象用的最多的可能就是递归操作了,下面用一个阶乘实现简单的递归操作。

    function test3(num){
        if(num <= 1){
            return 1;
        }else{
            //  return num * test3(num -1);
			//	如果我们把test3置空,在进行递归操作时,会报"object is not a function"的错误
            return num * arguments.callee(num -1);
			//	故推荐使用arguments.callee来调用自己
			//	同理,在上文的判断参数个数是否相等时,也是如此道理
        }
    }

    var T = test3;
    test3 = null;
	//	定义一个T变量存储test3方法,置空test3

    console.log(T(5));
	//	120

需要注意的是,arguments对象不能脱离函数体使用。