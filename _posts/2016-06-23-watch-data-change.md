---
layout: post
title: 检测数据变化
date: 2016-06-23
categories: [javascript]
---

MVVM一直是最近几年的很火的一个词之一,以angularjs和Vue为代表的都是这种模式,但是实现完全不同。Vue是通过ES5中的新增方法Object.defineProperty并且给该属性指定getter/setter(setter上调用observe方法)方法来实现的;而angularjs中则是通过脏检查来实现该模式,也就是对所有数据当都调用一个轮询($digest),然后比对每个属性值,如果发生变化,就调用相应的处理回调函数,这种方式的缺点显而易见,当数据达到一定数量时候,处理起来就显得笨重吃力,个人觉得可以给整个数据提供一个setData方法,传入需要设置的新数据,然后内部做一个深拷贝,这样就只需要把新设置的数据和原来的数据进行对比,在性能上应该优于给所有数据轮询的方式。下面是具体实现:

    var _class2 = {};

    function Vm() {
    }

    Vm.prototype = {

        "constructor": Vm,

        //  外部调用setData
        "setData": function (data) {
        
            //  初始化数据
            if (!this.data) {
                this.data = data;
                console.log("initialize data");
            } else {
            
                //  深拷贝老数据,不然可能造成oldData指向新数据的问题
                var oldData = _copy(this.data, true);
                
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        this.data[i] = data[i];
                    }
                }
                
                //  获取比对结果(新设置的数据)
                var res = this.compareData(oldData, data);
                
                //  数据发生变化,打印出变化前后的数据
                if (res.isChanged) {
                    for (var j in res) {
                        if (j !== "isChanged" && res.hasOwnProperty(j)) {
                            console.group("data changed");
                            console.log("new data:");
                            console.log(res[j]["newData"]);
                            console.log("old data:");
                            console.log(res[j]["oldData"]);
                            console.groupEnd("data changed");
                        }
                    }
                } else {
                    console.log("data is not change!");
                }
            }
        },

        //  数据比对方法,在setData中自动调用
        "compareData": function (oldData, newData) {
            var res = {
                "isChanged": false
            };

            //  遍历每一项
            for (var i in newData) {
                var oldVal = oldData[i];
                var curVal = newData[i];

                //  不相等情况
                if (!_eq(oldVal, curVal, [], [])) {
                    res.isChanged = true;
                    
                    //  保存新数据和老数据
                    res[i] = {
                        "newData": curVal,
                        "oldData": oldVal
                    };
                }
            }
            return res;
        }

    };

    /**
     * 深度判断两个对象是否相等(摘自underscore中的eq方法)
     * @param a         第一个个对象
     * @param b         第二个对象
     * @param aStack    第一个栈
     * @param bStack    第二个栈
     * @returns {boolean}
     * @private
     */
    function _eq(a, b, aStack, bStack) {

        // 获取第一个对象原型上的类名
        var className = _class2.toString.call(a);

        /**
         * 检查两个基本数据类型的值是否相等
         * 对于引用数据类型,如果它们来自同一个引用(同一个对象进行比较),则认为其相等
         * 需要注意的是0 === -0的结果为true,所以后面的1 / a 和 1  / b 是来判断0 和 -0 的情况(1 / -0 = -Infinity) != (1 / 0 = Infinity)
         */
        if (a === b) return a !== 0 || 1 / a == 1 / b;

        /**
         * 处理undefined 和 null的情况
         * undefined == null 的结果为true,而undefined === null 的结果为false
         */
        if (a == null || b == null) return a === b;

        // 两个类名不同,直接返回false
        if (className != _class2.toString.call(b)) return false;

        switch (className) {
            case '[object String]':

                /**
                 * toString.call("str") == "[object String]" -> true
                 * toString.call(String("str")) == "[object String]" -> true
                 * toString.call(new String("str")) == "[object String]" -> true
                 */
                return a == ("" + b);
            case '[object Number]':

                /**
                 * +a 会把 a转换成一个数字,如果转换结果和原来不同则被认为NaN
                 * NaN != NaN,因此当a和b同时为NaN时,无法简单地使用a == b进行匹配,用相同的方法检查b是否为NaN(即 b != +b)
                 * 和刚进方法体一样,判断0和-0的情况
                 */
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':

                /**
                 * 把bool和date类型转换成对应的数字来比较
                 * +true -> 1 / +false -> 0 / +(new Date()) -> (new Date()).getTime()
                 */
                return +a == +b;
            case '[object RegExp]':

                //  匹配正则表达式的相关属性是否相同(元字符串/全局匹配/多行模式/忽略大小写)
                return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        }

        //  处理数组类型或对象类型(typeof [] = typeof {} = "object")
        if (typeof a != 'object' || typeof b != 'object') return false;

        //  在isEqual方法中传递的是空数组
        //  在方法体内部,判断的会再次进行传递被操作后的a堆和b堆
        var length = aStack.length;

        while (length--) {
            // 如果堆中的某个对象与数据a匹配,则再判断另一个堆中相同位置的对象是否等于第二个对象
            if (aStack[length] == a) return bStack[length] == b;
        }

        // 获取两个对象的构造器
        var aCtor = a.constructor, bCtor = b.constructor;

        //  判断两个对象如果不是不是同一个类的实例则认为不相等
        if (aCtor !== bCtor && !(_isType(bCtor, "function") &&
            (aCtor instanceof aCtor) &&
            _isType(bCtor, "function") &&
            (bCtor instanceof bCtor))) {
            return false;
        }

        // 把a和b分别放到a堆和b堆中
        aStack.push(a);
        bStack.push(b);

        //  局部变量
        var size = 0, result = true;

        // 数组类型比较
        if (className == '[object Array]') {
            size = a.length;

            //  比较两个数组的长度是否相等
            result = size == b.length;

            //  如果长度相同,再依次比较数组的每项
            if (result) {
                while (size--) {
                    if (!(result = _eq(a[size], b[size], aStack, bStack))) break;
                }
            }
        } else {

            // 如果是对象类型,枚举第一个对象,判断b和a中的每个属性值是否相同,记录a中属性值的个数
            for (var key in a) {
                if (a.hasOwnProperty(key)) {
                    size++;
                    if (!(result = b.hasOwnProperty(key) && _eq(a[key], b[key], aStack, bStack))) break;
                }
            }

            /**
             * 如果a中有的属性b中都有
             * 再枚举b对象,判断长度,如果b中属性值的长度大于size则result为false(!1 = false / !0 = true)
             */
            if (result) {
                for (key in b) {
                    if (b.hasOwnProperty(key) && !(size--)) break;
                }

                // 当对象b中的属性多于对象a, 则认为两个对象不相等
                result = !size;
            }
        }

        // 删除堆中的数据,防止再进行迭代
        aStack.pop();
        bStack.pop();

        //  返回比较结果
        return result;
    }

    /**
     * 拷贝一个对象(摘自underscore中的copy方法)
     * @param obj   被拷贝的对象
     * @param deep  是否深拷贝
     * @returns {*}
     * @private
     */
    function _copy(obj, deep) {
        //  typeof []/{} -> "object"
        var copied;
        if (!deep || obj == null || typeof obj !== "object") {
            return obj;
        }
        var copied;
        if (_isType(obj, "Object")) {
            copied = {};
        } else if (_isType(obj, "Array")) {
            copied = [];
        }
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                copied[i] = obj[i];
            }
        }
        return copied;
    }

    /**
     * 判断一个对象是否为指定类型
     * @param obj           被判断的对象
     * @param typeStr       类型字符串
     * @returns {boolean}
     * @private
     */
    function _isType(obj, typeStr) {
        return _class2.toString.call(obj).toLowerCase() === ("[object " + typeStr + "]").toLowerCase();
    }

HTML中则可以如下调用:

    var vm = new Vm();
    vm.setData({
        "arr": [1,2,4],
        "obj": {
            "name": "son",
            "age": 23
        }
    });

    vm.setData({
        "arr": [1,2,3,4],
        "obj": {
            "name": "rwson",
            "age": 24
        },
        "added": "new add data"
    });
        
 
最后控制台输出信息如下图所示:

![result](http://rwson.github.io/assets/img/posts/watch-data-change.png)