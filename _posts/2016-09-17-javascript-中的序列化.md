---
layout: post
title: javascript中的序列化
date: 2016-09-17
categories: [技术]
---
在用jQuery发送ajax(POST)请求的时候,最常见的提交方式就是"application/x-www-form-urlencoded",通常都会传入一个data属性作为传输给后端的数据,在ajax发送之前,那么我们直接如果直接传入把这个对象传递给后端,后端就不能对该对象进行解析,因为对象会被转成字符串"[object Object]",所以就需要我们对该对象进行url编码,并且转换成字符串,再传给后端。

假设我们先传递一个简单的对象(所有的key对应的value都不是引用类型[Array、Object]),就像下面这样:

    {
        string: "string",
        number: 1
    }
    
用jQuery中的$.ajax方法,POST提交,打开请求面板,在form data那边,点击view source,可以看到下面这一串字符串,就像下面的样子:

    string=string&number=1

在jQuery中,$.param这个方法可以实现进行url编码的作用。

现在可以自己实现一个:

    //  获取对象上的类名
    function _typeOf(obj) {
        return {}.toString.call(obj).slice(8, -1);
    }

    //  encodeURIComponent简写
    function _encode(data) {
        data = data || "";
        return encodeURIComponent(data);
    }

    //  序列化主函数
    function _serializenData(data) {
        var res = data,
            typeIn;
            
        //  判断传入的是否是一个Object类型的数据
        if (_typeOf(data) === "Object") {
            res = [];
            for (var i in data) {
                typeIn = _typeOf(data[i]);
                switch (typeIn) {

                    //  遇到Object、Array时需要进行遍历或者枚举,对其内部元素、属性做处理后再放到结果集数组中
                    case "Object":
                        res.push(_loopObject(data[i], i));
                        break;

                    case "Array":
                        res.push(_loopArray(data[i], i));
                        break;

                    //  其他类型直接推到结果集数组
                    default:
                        res.push(_encode(i) + "=" + _encode(data[i]));
                        break;

                }
            }
            //  把结果集数组转换成"xxx=111&yyy=333&zzz=444"的形式
            res = res.join("&").replace("%20", "+")
        }
        return ("" + res);
    }

    /**
     * 深层遍历一个数组
     * @param  {[type]} array [description]
     * @param  {[type]} key   [description]
     * @return {[type]}       [description]
     */
    function _loopArray(array, key) {
        var res = [],
            typeIn;
        for (var i = 0, len = array.length; i < len; i++) {
        
            //  获取每一项的类名,如果是Object/则递归调用_loopArray/_loopObject,传入当前项和属性名,处理子项,再放到结果集中
            typeIn = _typeOf(array[i]);
            switch (typeIn) {

                case "Array":
                    res.push(_loopArray(array[i], (key + "[" + i + "]")));
                    break;

                case "Object":
                    res.push(_loopObject(array[i], (key + "[" + i + "]")));
                    break;

                //	其他类型的直接推到结果集数组
                default:
                    res.push(_encode(key + "[]") + "=" + _encode(("" + array[i])));
                    break;

            }
        }
        
        //  把结果集转换成"xxx=111&yyy=333&zzz=444"的形式
        return res.join("&");
    }

    /**
     * 深层遍历一个对象
     * @param  {[type]} object [description]
     * @param  {[type]} key    [description]
     * @return {[type]}        [description]
     */
    function _loopObject(object, key) {
        var res = [],
            typeIn;
        for (var i in object) {
            //  取得一个当前key对应value的类名,如果是Object/Array,则进行递归调用
            typeIn = _typeOf(object[i]);
            switch (typeIn) {
                case "Array":
                    res.push(_loopArray(object[i], key + "[" + i + "]"));
                    break;

                case "Object":
                    res.push(_loopObject(object[i], key + "[" + i + "]"));
                    break;

                //	其他类型的直接推到结果集数组中
                default:
                    res.push(_encode(key + "[" + i + "]") + "=" + _encode(("" + object[i])));
                    break;
            }
        }
        
        //  把结果集转换成"xxx=111&yyy=333&zzz=444"的形式
        return res.join("&");
    }

下面我们模拟几个复杂点的对象,调用封装的序列化方法,和$.param进行对比:

    var obj = {
        string: "string",
        number: 1,
        array: [1, 2, 3, 4, 5]
    };

    var obj2 = {
        string: "string",
        number: 1,
        array: [
            1, 2, 3, 4, 5, {
                key1: "value1",
                key2: "value2",
                key3: "value3"
            }
        ]
    };

    var obj3 = {
        array: [1, 2, 3, 4, 5],
        arrayobject: [{
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }, {
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }, {
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }]
    };

    var deepObj1 = {
        arr: [{
            string: "string",
            number: 1,
            arr: [1, 2, 3, 4],
            mixArr: [{
                key1: "value1",
                key2: "value2"
            }, {
                key1: "value1",
                key2: "value2"
            }, {
                key1: "value1",
                key2: "value2"
            }]
        }]
    };

    var deepObj2 = {
        obj: {
            key1: "value1",
            key2: "value2",
            key3: "value3"
        },
        array: [1, 2, 3, 4, 5],
        objectArray: {
            array: [1, 2, 3, 4, 5, {
                key1: "value1",
                key2: "value2",
                key3: "value3"
            }]
        },
        arrayObj: [{
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }, {
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }, {
            key1: "value1",
            key2: "value2",
            key3: "value3"
        }]
    };

    //  打开控制台的console面板,查看输出

    console.group("serialize obj");
    console.log(_serializenData(obj));  //  ...
    console.log($.param(obj));  //  ...
    console.log(_serializenData(obj) === $.param(obj)); //  true
    console.groupEnd();

	console.group("serialize obj2");
    console.log(_serializenData(obj2)); //  ...
    console.log($.param(obj2)); //  ...
    console.log(_serializenData(obj2) === $.param(obj2));   //  true
    console.groupEnd();    

	console.group("serialize obj3");
    console.log(_serializenData(obj3)); //  ...
    console.log($.param(obj3)); //  ...
    console.log(_serializenData(obj3) === $.param(obj3));   //  true
    console.groupEnd();

	console.group("serialize deepObj1");
    console.log(_serializenData(deepObj1)); //  ...
    console.log($.param(deepObj1)); //  ...
    console.log(_serializenData(deepObj1) === $.param(deepObj1));   //  true
    console.groupEnd();

	console.group("serialize deepObj2");
    console.log(_serializenData(deepObj2)); //  ...
    console.log($.param(deepObj2)); //  ...
    console.log(_serializenData(deepObj2) === $.param(deepObj2));   //  true
    console.groupEnd();
