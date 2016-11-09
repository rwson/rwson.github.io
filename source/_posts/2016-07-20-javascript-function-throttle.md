---
layout: post
title: javascript函数节流
date: 2016-07-20
categories: [javascript, 函数节流]
---

如果我们需要做一个过滤的功能,类似于下面这个效果

![](/imgs/screen.gif)

我们需要给input绑定一个keyup事件,然后根据它的value操作页面或者过滤数据重新渲染页面,但是在数据比较多的时候,如果在keyup里面不做一定限制的话,在性能方面就会有一些影响,这时候,就需要"函数节流"这个东西。

在underscore这个库中提供了一个函数节流的方法,其实就是在一定时间内判断某个函数是否被执行过。

就拿我们上面的效果来说:
	
	
	//  HTML
	<input type="text" id="input" />
	<ul id="ul">
		<li>111111111</li>
		<li>22222222</li>
		<li>333333</li>
		<li>4444</li>
		<li>1234</li>
		<li>5678</li>
		<li>9999</li>
		<li>6789</li>
		<li>01234</li>
	</ul>
	
	
	//  javascript
		window.onload = function() {
			var input = document.getElementById("input");
			var ul = document.getElementById("ul");
			var li = ul.getElementsByTagName("li");
			var len = li.length;
			var value, timeout = null;
			input.onkeyup = function(ev) {
			    //  上次的还没执行
			    if(timeout) {
			        return;
			    }
			    timeout = setTimeout(function() {
    			    clearTimeout(timeout);
                    value = ev.target.value.trim();
    				for(var i = 0; i < len; i ++) {
    					if(li[i].innerHTML.indexOf(value) > -1) {
    						li[i].style.display = "block";
    					} else {
    						li[i].style.display = "none";
    					}
    				}
			    }, 200);
			};

	};
	
下面可以把这个函数再次进行封装:


    /**
     * 函数节流
     * @param fn        回调函数
     * @param delay     延迟多久
     * @param atleast   至少多久触发一次
     * @return Function
     */
    function throttle(fn, delay, atleast) {
        var timer = null;
        var previous = null;
     
        return function () {
            var now = +(new Date());
     
            if ( !previous ) {
                previous = now;
            }
     
            if ( now - previous > atleast ) {
                fn();
                // 重置上一次开始时间为本次结束时间
                previous = now;
            } else {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn();
                }, delay);
            }
        }
    };
    
    
在平时可以有好多地方用到函数节流,比如浏览器的resize,鼠标滚轮事件等等。