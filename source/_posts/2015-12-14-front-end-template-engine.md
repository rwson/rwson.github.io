---
layout: post
title: 实现一个简单的模板引擎
date: 2015-12-14
categories: [javascript, 模板引擎]
---

在最开始想要把数据显示到页面上,我们可以需要用到一些后端的模板引擎(比如java中的Freemarker等),随着技术的发展,前端会把数据从后端取回来,用拼接HTML或者模板引擎的方式来呈现页面,如果布局结构简单还好,但是如果碰到复杂结构的时候,前者可能显得比较吃力,且容易出错。

比较著名的一些前端模板引擎有Handlebars、Underscore.js(一个javascript工具库的集合,带模板引擎)等等。各自也有各自的语法。

前端模板引擎带来了很多嚎头,(预)编译、缓存、渲染等等,下面我们实现一个简单的模板引擎。

首先想一下,在用模板引擎和拼接字符串时最大的区别是什么?就是一个是通过手动的绑定属性,一个是像写HTML一样把属性绑定好:


    //  比如有这么一段数据
    var data = [
        {
            name: "foo",
            age: 23
        },
        {
            name: "bar",
            age: 25
        }
    ];
    
    //  字符串拼接的写法
    var html = "";
    for(var i = 0, len = data.length; i < len; i ++) {
        html += "<div class='item'><span class='name'>" + data[i].name + "</span><span class='age'>" + data[i].age + "</span></div>";
    }
    
    document.getElementById("target").innerHTML = html;
    
    //  模板引擎
    <script type="text/template">
        <% for(var i in obj) %>
            <div class="item">
                <span class="name">
                    <%= obj[i].name %>
                </span>
                <span class="age">
                    <%= obj[i].age %>
                </span>
            </div>
        <% } %>
    </script>

可以看到模板引擎的写法明显清楚了许多。

要实现一个模板引擎,首先需要定义一个编译方法。我们先来定义一些变量:

    //  缓存,调用编译方法的时候,先检测缓存中是否存在,如果有,直接取出来返回
    var _cache = {};

    //  取值表达式正则(<%= obj[i].name %>这种)
    var _valueReg = /<%=(\s\S+?)%>/;

    //  js可执行语句正则(<% alert(123); %>这种)
    var _evaluateReg = /<%(\s\S+?)%>/;

    //  匹配HTML特殊字符
    var _htmlReg = /<|>|&/g;

    //  特殊转义正则(<$ obj.htmlTag $> 防止有些标签被当成普通文本来渲染,比如带链接的a标签,被渲染成了"<a href='xxxx'>yyyy</a>")
    var _escapeReg = /<$(\s\S+?)$>/;

    //  特殊字符
    var _charReg = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    //  最终的匹配语句
    var _matcher = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|<\$([\s\S]+?)\$>|$/g;

    //  HTML转义
    var _escapeHtml = {

        "escapehash": {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;"
        },

        //  转义方法,取得escapehash中对应的转义符返回
        "escaping": function(char) {
            return _escapeHtml.escapehash[char];
        }
    };

    //  匹配特殊字符
    var _escapeCharater = {

        "escapehash": {
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2f;",
            "\\": "\\\\",
            "\r": "",
            "\n": "",
            "\t": "",
            "\u2028": "\\u2028",
            "\u2029": "\\u2029"
        },

        //  转义方法,取得escapehash中对应的转义符返回
        "escaping": function(char) {
            return _escapeCharater.escapehash[char];
        }
    };


变量都定义完了,开始实现一个编译方法:

    /**
      * 编译方法
      * @param  str String   需要被编译的字符串
      * @return String
      **/
    function complie(str) {
    
        //  fnBody存储最后返回的函数体
        var fnBody = "";
        
        //  缓存上一次replace后的偏移
        var index = 0;
        
        //  检测缓存
        if (!_cache[str]) {
            fnBody = "var _temp = '';_temp += '";
            
            //  替换之前定义的匹配语句中的相关字符串,并做处理
            str.replace(_matcher, function(match, value, evaluate, escapeStr, offset) {
            
                //  截取相关字符串拼接到函数体
                fnBody += str.slice(index, offset).replace(_charReg, _escapeCharater.escaping);

                //  可执行语句
                if (evaluate) {
                    fnBody += "';" + evaluate + "_temp += '";
                }

                //  <%= xxx[.yyy] %> -> 普通的取值表达式
                if (value) {
                    fnBody += "' + " + value + " + '";
                }

                //  <$ xxx $> -> HTML特殊字符转义
                if (escapeStr) {
                    fnBody += "' + " + ("obj." + escapeStr).replace(_htmlReg, _escapeHtml.escaping) + " + '";
                }

                //  更新下一次截取字符串的偏移地址
                index = offset + match.length;
            });
            fnBody += "';return _temp;";

            //  塞到缓存,方便下次有相同模板的时候,不用再去编译
            _cache[str] = fnBody;
        } else {
        
            //  从缓存区
            fnBody = _cache[str];
        }
        
        return fnBody;
    }

至此一个编译方法就实现好了。再来看render方法的实现:
    
    /**
      * 渲染方法
      * @param  fnBody String   编译出来后的函数体
      * @param  data            数据
      * @return String
      **/
    function render(fnBody, data) {
        return new Function("obj", fnBody)(data);
    }

    //  挂载到全局对象
    window.Template = {
        complie: complie,
        render: render
    };

到这就完成了一个简单的模板引擎,需要注意的是在render方法中的

    new Function("obj", fnBody)(data)

就意味着我们在用该模板引擎绑定相关数据的时候,必须用obj.xxx这种来读取,否则将不能被解析,很多模板利用with这个关键字动态的修改函数体内的this指向的方式,支持可以省略前面的"obj.",而直接读取数据。

具体代码请移步我的[GitHub](https://github.com/rwson/Template)
