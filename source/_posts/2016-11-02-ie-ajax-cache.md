---
layout: post
title: IE下AngularJs中的ajax缓存
date: 2016-11-02
categories: [javascript, AngularJs, ajax]
---

在单页应用越来越普及的今天,越来越多的项目都会采用这种方案,这几天用AngularJs做了一个PC端应用,有登录注册的功能,登录注册的功能是通过ajax实现的,在登录注册以后页面不刷新,只修改$rootScope下的某些属性值,然后在页面里面通过ng-if之类的指令来控制相关元素的显示隐藏。

之前的大概实现如下:

    //  js
    var app = angular.module("app", []);
    app.run(["$rootScope", "$http", function($rootScope, $http) {
        $rootScope.isLogin = false;
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $http.get("xxxx")
            .success(function(res) {
                $rootScope.isLogin = !!(res.isLogin);
                //  ...
            })
            .error(function() {
                //  ...
            });
        });
    }]);

    //  HTML
    <div class="container">
        <a href="/user/center" ng-if="isLogin">用户中心</a>
        <a href="javascript:;" ng-click="logout()" ng-if="isLogin">登出</a>
        <a href="/login" ng-if="!isLogin">登录</a>
    </div>

后来发现在Chrome/Firefox下都是好的,到了IE下登录以后不刷新就显示不对。原来以为是ng-if在IE下重新渲染过慢的问题,改成ng-show以后还是不行,然后看http状态码,发现是304,想到可能和缓存有关系,后来改了配置中关键ajax请求那边的东西,发现可以了,核心代码如下:


    app.config(["$routeProvider", "$httpProvider", function($routeProvider, $httpProvider){
        //  ...
        
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
        $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache";
        $httpProvider.defaults.headers.get["Pragma"] = "no-cache";
    }]);

