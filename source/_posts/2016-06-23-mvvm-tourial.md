---
layout: post
title: 实现一个迷你MVVM
date: 2016-06-23
categories: [javascript, MVVM]
---

在近几年,MVVM模式一直很火热,其全称为"Model-View-ViewModel",MVVM火的主要原因就是在用这种模式开发的,更多的只需要关注数据层的东西,不需要花额外的时间去维护视图,包括angular/Vue都是这种开发模式,但是两者的原理是截然不同的,现在参考Vue的实现原理,简单实现一个MVVM框架,支持的指令有"vm-modle"、"vm-click"、"vm-bind",代码量大概在300行左右,先来看下用法:

    //  HTML
    ...
    
        	<div id="app">
                <input type="text" class="text-filed" vm-model="text" />
                <p class="bind-text" vm-bind="text"></p>
                <div class="click-area" vm-click="clicked()">点我</div>
                <div class="click-area" vm-click="clickWitharguments(text)">点我(带参数)</div>
            </div>
    
    ...
    
    //  javascript
    
    window.onload = function() {
    
        var clickTimes = 0, e;
        
        //  调用MVVM
	    MVVM({
	        el: document.querySelector("#app"),
            data: {
	            text: "I'm an attribute named 'text' under data"
            },
            methods: {
                clicked: function () {
                    e = event;
                    clickTimes ++;
                    e.target.innerHTML += "<p>第" + clickTimes  + "次点击 - " + Date.now() + "</p>";
                },
                clickWitharguments: function (text) {
                    e = event;
                    e.target.innerHTML += "<p>此时data.text = " + text + "</p>";
                }
            }
        });
	};


上面就是一个简单的调用了,下面我们先实现几个工具方法和定义一些基本变量:

    //  MVVM.js
    
    //  用匿名函数自执行的方式,前面加分号的原因是为了防止压缩后的保存
    ;(function(root) {
    
        //  ...
        
        
            //  匹配指令开头("vm-click","vm-model"等)
        var direcivePrefix = /^vm\-/,
            
            //  缓存document
            doc = document,
            
            //  缓存document.body
            body = doc.body,
            
            //  指令Map对象,用于分类存储每个表达式,方便后期更新视图
            dirsMap = {},
            
            //  缓存Array.prototype
            arr2 = [],
            
            //  缓存Object.prototype
            obj2 = {};
        
        
        /**
         * 获取对象上的类名
         * @param obj
         * @return {String}
         */
        function typeOf(obj) {
            return obj2.toString.call(obj).slice(8, -1);
        }
        
       /**
        * 把元素上绑定的指令转换成数组返回
        * @param el
        * @return {Array.<Object>}
        */
        function mapAttributeToArray(el) {
            var res = [],
                attributes, i, len;
            if (el && el.nodeType === 1) {
                attributes = arr2.slice.call(el.attributes);
                attributes.forEach(function (attr) {
                    if (direcivePrefix.test(attr.name)) {
                        res.push({
                            name: attr.name,
                            value: attr.value,
                            el: el
                        });
                    }
                });
            }
            return res;
        }
        
        /**
         * 转换成驼峰写法(vm-bind -> VMBind)
         * @param str
         */
        function toCamelCase(str) {
            if (str.length) {
                return str.split("-").map(function (str, index) {
                    if(index > 0) {
                        return str.slice(0,1).toUpperCase() + str.slice(1);
                    }
                    return str.toUpperCase();
                }).join("");
            }
            return "";
        }


        /**
         * 递归扫描节点
         * @param rootEl        根节点
         * @param callback      扫描后的回调
         */
        function scanNode(rootEl, callback) {
            var child = arr2.slice.call(rootEl.childNodes),
                deepChild;
            if(child.length) {
                child.forEach(function (el) {
                    if(el.nodeType === 1 && !el.vmcomplied) {
                        callback(el);
                        scanNode(el, callback);
                    }
                });
            }
        }

        /**
         * ES5(Object.defineProperty)
         * @param target
         * @param key
         */
        function defineProperty(target, key) {
            //  同时设置一个"_" + key的属性值,后面取值直接用
            target["_" + key] = target[key];
            Object.defineProperty(target, key, {
            	get: function() {
            		return this["_" + key];
            	},
            	set: function(newV) {
            	    //  用之前设置的"_" + key的值来比较
            		if(newV !== this["_" + key]) {
            			this["_" + key] = newV;
            			this[key] = newV;
            			
            			//  取得当前属性绑定的指令并且判断,更新视图
            			if(typeOf(dirsMap[key]) === "Array" && dirsMap[key].length) {
            				dirsMap[key].forEach(function(dir) {
            					dir.update();
            				});
            			}
            		}
            	}
            });
            return target;
        }

        //  ...
        
    
    })(window)

上面实现了一些工具方法,完成的功能主要有扫描子节点,把元素上绑定 的属性绑定的指令取出来变成一个数组,转驼峰等等,下面就是MVVM的入口了:

    //  MVVM.js
    
    //  ...

    /**
     * MVVM构造函数
     * @param opt
     * @return {MVVM.init}
     * @constructor
     */
    function MVVM(opt) {
        //  模仿jQuery中的无"new"操作符
        return new MVVM.fn.init(opt);
    }

    MVVM.fn = MVVM.prototype = {

        //  修正原型下的构造器
        constructor: MVVM,

        /**
         * MVVM入口
         * @param opt
         */
        init: function (opt) {
            //	参数校验,转换
            this.el = (opt.el && opt.el.nodeType === 1) ? opt.el : body;
            this.data = (typeOf(opt.data) === "Object") ? opt.data : {};
            this.methods = (typeOf(opt.methods) === "Object") ? opt.methods : {};
            this.scan();
        },

        /**
         * 扫描编译
         */
        scan: function () {
        
            //  从根节点开始扫描
            scanNode(this.el, function (currentEl) {
            
                //  取得当前元素上的指令数组
                var dirList = mapAttributeToArray(currentEl);
                if(dirList.length) {
                
                    //  循环编译指令
                    dirList.forEach(function (dir) {
                        dir.dirName = toCamelCase(dir.name);
                        if(directiveMap[dir.dirName]) {

                            //  实例化指令
                            dir.dirIns = new directiveMap[dir.dirName](currentEl, dir.value, this.data, this.methods);

                            //  给当前属性指定getter/setter
                            if(this.data[dir.value]) {
								defineProperty(this.data, dir.value);
                           	}

                            //  dirsMap[dir.value]类型判断
                            if(typeOf(dirsMap[dir.value]) !== "Array") {
                            	dirsMap[dir.value] = [];
                            }

                            //  vm-modle之类不需要更新视图
                            if(dir.name !== "vm-model") {
                                dirsMap[dir.value].push(dir.dirIns);
                            }
                        } else {
                            //  没有找到相关指令构造函数
                            throw new Error("unsupported directive" + dir.name + "!");
                        }
                    }, this);
                }
            }.bind(this));
        }

    };

    //  修改MVVM.fn.init的prototype
    MVVM.fn.init.prototype = MVVM.fn;

    //  挂载到全局对象
    root.MVVM = MVVM;

    //  ...

上面就是MVVM.js的全部内容了,MVVM的入口算是完成了,下面我们一起构造之前提到的指令:

    //  directive.js
    
    ;(function (root) {
        
            //  匹配指令值中的"clicked()"后面的"()"
        var bracketsReg = /\(\)/,
        
            //  匹配指令值中的"clickWitharguments(text)"后面的"(text)"
            bracketsArguReg = /\([\s\S]+\)/;

        /**
         * vm-bind指令
         * @param el
         * @param expr
         * @param data
         * @param methods
         * @constructor
         */
        function VMBind(el, expr, data, methods) {
            this.el = el;
            this.expr = expr;
            this.data = data;
            this.methods = methods;
            this.init();
        }
    
        VMBind.prototype = {
    
            constructor: VMBind,
    
            /**
             * 初始化方法
             */
            init: function () {
                this.el.textContent = this.data["_" + this.expr];
            },
            
            /**
             * 更新视图
             */
            update: function () {
                this.init();
            }
    
        };
        
        /**
         * vm-model指令
         * @param el
         * @param expr
         * @param data
         * @param methods
         * @constructor
         */
        function VMModel(el, expr, data, methods) {
            this.oldVal = "";
            this.el = el;
            this.expr = expr;
            this.data = data;
            this.methods = methods;
            this.init();
        }
    
        VMModel.prototype = {
    
            constructor: VMModel,
    
            /**
             * 初始化方法
             */
            init: function () {
                var currentVal;
                this.oldVal = this.data[this.expr];
                this.el.value = this.oldVal;
                
                //  input元素的校验
                if (this.el.tagName.toLowerCase() === "input") {
                    this.el.addEventListener("keyup", function () {
                        currentVal = this.el.value;
                        
                        //  输入值较之前有变化
                        if (currentVal !== this.oldVal) {
                            this.update(currentVal);
                            this.oldVal = currentVal;
                        }
                    }.bind(this), false);
                }
            },
    
            /**
             * 更新model中的相关属性值,触发其他指令实例下的update方法
             */
            update: function (newV) {
                this.data[this.expr] = newV;
            }
    
        };
        
        /**
         * vm-click指令
         * @param el
         * @param expr
         * @param data
         * @param methods
         * @constructor
         */
        function VMClick(el, expr, data, methods) {
            this.el = el;
            this.expr = expr;
            this.data = data;
            this.methods = methods;
            this.init();
        }
    
        VMClick.prototype = {
            constructor: VMClick,
    
            /**
             * 初始化方法
             */
            init: function () {
                //  取得方法相对于methods中的指针
                var callback = this.methods[this.expr.replace(bracketsReg, "").replace(bracketsArguReg, "")],
                    data = this.data,
                    tmp = "",
                    args = [];
                
                //  类型校验
                if (typeof callback === "function") {
                    this.el.addEventListener("click", function (e) {
                        //  参数处理,当前指令对应的值是"abc(de)"而不是"abc"的形式
                        if(!bracketsReg.test(this.expr) && bracketsArguReg.test(this.expr)) {
                            tmp = this.expr.match(bracketsArguReg)[0].replace(")", "").replace("(", "").split(",");
                            
                            //  依次取得相关参数
                            args = tmp.map(function (name) {
                                return data["_" + name.trim()];
                            });
                        }
                        
                        //  执行相关方法
                        callback.apply(root, args);
                    }.bind(this), false);
                }
            }
        };

        //  挂载到window对象下
        root.directiveMap = {
            VMBind: VMBind,
            VMModel: VMModel,
            VMClick: VMClick,
        };
        
    })(window)
    
好了,到这里我们的MVVM入口和指令都全部实现好了,下面一起看下效果吧:

![运行效果](/imgs/mvvm-run.gif)
