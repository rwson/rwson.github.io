---
layout: post
title: 实现一个webpack loader
date: 2017-01-18
categories: [javascript,构建工具,webpack]
---

在React,ES6开发模式越来越普及的今天,webpack就成了前端构建的一个标配。webpack有两大重要部分组成: loader和plugin。loader是用在应用源码上的转换原件,比如最常用到的babel-loader/jsx-loader/file-loader/css-loader/url-loader等等。

loader可链式执行,一种文件类型可以用多个loader(比如css文件,可能就需要用到css-loader和style-loader),loader之间用"!"分隔,当前loader处理完,把处理结果带到下一个loader,最后一个loader返回一个String或者String Buffer返回给compiler。

loader调用方式大体有3种形式:

1. 引用时调用
    
        //  a.js

        require("style-loader/url!css-loader!./xxx.css");

2. webpack直接调用

        //  webpack.config.js
        
        //  ...
        
        module: {
            loaders: [
                //  ...
                
                {
                    test: /\.css$/,
                    loader: "style-loader!css-loader"
                }
            ]
        }

3. 指定loaders数组

        //  webpack.config.js
        
        //  ...
        
        module: {
            loaders: [
                //  ...
                
                {
                    test: /\.css$/,
                    loaders: [
                        "style-loader",
                        "css-loader"
                    ]
                }
            ]
        }


webpack官网上说"A loader is a node module exporting a function",也就是说一个loader就是一个暴露出去的node模块,既然是一个node module,也就基本可以写成下面的样子:

    module.exports = function() {
        
        //  ...
    };

需要注意的是,在该模块被调用时,传入的第一个参数是文件的内容,所以我们可以再改改:

    
    /**
     * @param content  将被处理的内容
     *
     **/
    module.exports = function(content) {
        
        //  ...
        
        //  运行下一个loader
        this.callback(content);
    };
    
知道了大体写法,现在我们就来实现一个简单的loader,主要功能就是把css中的px单位转换成rem单位
    
    
    //  px2rem-loader/index.js
    
    "use strict";

    //  用来获取调用loader时传入的参数等等
    var loaderUtils = require("loader-utils");
    
    //  css解析模块
    var css = require("css");
    
    //  乘除模块,防止在计算中出现精度丢失的问题
    var privateMath = {
    
        mul: function(num1, num2) {
            var m = 0,
                s1 = num1.toString(),
                s2 = num2.toString();
            try {
                m += s1.split(".")[1].length
            } catch (e) {}
            try {
                m += s2.split(".")[1].length
            } catch (e) {}
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },
        div: function(num1, num2) {
            var t1, t2, r1, r2;
            try {
                t1 = num1.toString().split('.')[1].length;
            } catch (e) {
                t1 = 0;
            }
            try {
                t2 = num2.toString().split(".")[1].length;
            } catch (e) {
                t2 = 0;
            }
            r1 = Number(num1.toString().replace(".", ""));
            r2 = Number(num2.toString().replace(".", ""));
            return (r1 / r2) * Math.pow(10, t2 - t1);
        }
    };
    
    module.exports = function(content) {
    
        //  把当成css内容解析成AST对象
        var contentAST = css.parse(content);
    
        //  使用loader时的queryString(相关参数)
        var query = loaderUtils.parseQuery(this.query);
    
        //  最小px值,当数组小于它是忽略计算
        var minSize = query.minSize || 1;
        
        //  基数(最后计算出的结果 = (原先的大小 / base / scale) + "rem")
        var base = query.base || 37.5;
        
        //  忽略的样式规则名称
        var ignore = query.ignore.length ? query.ignore.split("|") : [];
        
        //  缩放比
        var scale = query.scale || 1;
        
        //  匹配10px或者10.5px这种单位
        var pxUnitReg = /\d+[\.{1}\d+]?px/gi;
        
        var tmp;
        
        //  遍历样式树
        contentAST.stylesheet.rules.forEach(function(rule) {
            //  遍历样式表
            rule.declarations.forEach(function(style) {
                if (ignore.indexOf(style.property) < 0) {
                    style.value = style.value.replace(pxUnitReg, function(match) {
                        tmp = parseFloat(match);
                        if(tmp > minSize) {
                            return privateMath.div(tmp, privateMath.mul(base, scale)) + "rem";
                        }
                    });
                }
            });
        });
        
        
        //  再把处理好的AST对象转成css String
        content = css.stringify(contentAST);
    
        //  调用下一个loader
        this.callback(null, content);
    
    };
    
到这里,一个简单的load就算实现了,一起来看下调用把:

    //  webpack.config.js
    const webpack = require("webpack");

    module.exports = {
        entry: "./src/js/entry.js",
        output: {
            path: __dirname,
            filename: "build/bundle.js"
        },
        module: {
            loaders: [{
                test: /\.js$/,
                loader: 'babel-loader?presets[]=es2015'
            }, {
                test: /\.css$/,
                loader: 'style-loader!css-loader!px2rem-loader?base=37.5&scale=2&minSize=1&ignore=border|margin|padding'
            }]
        },
        plugins: [
        ]
    };

之前的css:

![](/imgs/webpack-loader-1.png)

打包之后:

![](/imgs/webpack-px-2rem-compiled.png)
