---
layout: post
title: NodeJs中redis窜库插入
date: 2015-08-20
categories: [技术]
---

最近在用NodeJs+redis搭建一个类似漂流瓶的服务器,有个需求如下:根据漂流瓶的类型来将数据用hash的方式插入到数据库中,这边类型主要根据性别(male/female)来区分,当类型为male时插入到0号数据库,female时插入到1号数据库。

先贴代码:

    var redis = require('redis'),
        client = redis.createClient();
    
    /**
     * 扔一个漂流瓶,随机分配一个id当存入redis的建,然后根据不同的类型存放到不同的数据库
     * @param  {[type]}   bottle   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    exports.throw = function (bottle, callback) {
        bottle.time = bottle.time || Date.now();
        var bottleId = Math.random().toString(16),
        //	为每个瓶子随机生成一个id
    
            type = {
                'male': 0,
                'female': 1
            };
        //	根据不同类型将不同漂流瓶保存到不同的数据库
        
        console.log('现在应该选择' + type[bottle.type] + '号数据库进行插入');
        
        client.SELECT(type[bottle.type], function () {
            client.HMSET(bottleId, bottle, function (err, res) {
                //	以hash类型保存漂流瓶对象
    
                if (err) {
                    return callback({
                        'code': 0,
                        'msg': '过会再试吧!'
                    });
                }
                //	保存出错
    
                callback({
                    'code': 1,
                    'msg': res
                });
                //	保存成功
    
                client.EXPIRE(bottleId, 86400);
                //	设置过期时间,每个漂流瓶的生成时间为1天
            });
        });
    };

这是原来的实现方法,然后路由是这样实现的:

    //	扔一个漂流瓶
    //	post ?owner=xxx&type=xxx&content=xxx[&time=xxx]modules
    app.post('/',function(req,res){
    	if(!req.body.owner || !req.body.type || !req.body.content){
    		if(req.body.type && (['male','female'].indexOf(req.body.type) == -1)){
    			return res.json({
    				'code':0,
    				'msg':'类型错误!'
    			});
    			return res.json({
    				'code':0,
    				'msg':'信息不完整!'
    			});
    		}
    	}
    	redis.throw(req.body,function(result){
    		res.json(result);
    	});
    });
    
再写了几条测试数据:

    var request = require('request');
    //  Nodejs的request模块,用来模拟请求
    
    for(var i = 1;i <= 5;i ++){
    	(function(i){
    		request.post({
    			'url':'http://127.0.0.1:3000/',
    			'json':{
    				'owner':'bottle' + i,
    				'type':'male',
    				'content':'content' + i
    			}
    		});
    	})(i);
    }
    //	循环5条male数据
    
    for(var j = 6;j <= 10;j ++){
    	(function(j){
    		request.post({
    			'url':'http://127.0.0.1:3000/',
    			'json':{
    				'owner':'bottle' + j,
    				'type':'female',
    				'content':'content' + j
    			}
    		});
    	})(j);
    }
    //	循环5条female数据
    
模拟请求,发现根据类型取要插入的数据库选择对了,但是到最后都插入到1号库里去了,很奇怪的一个问题。

![](http://rwson.github.io/assets/img/posts/Node-redis-1.png)

![](http://rwson.github.io/assets/img/posts/Node-redis-2.png)

后来在网上找帖子,看到开源中国上有一篇关于窜库插入的,发现是由于没有维护好redis对象之间关系导致的这个问题,于是就把代码改成了下面的实现方式:

    var redis = require('redis'),
        client = redis.createClient(),
        client1 = redis.createClient();
    //	redis.createClient(port,host,opt)
    
    /**
     * 扔一个漂流瓶,随机分配一个id当存入redis的建,然后根据不同的类型存放到不同的数据库
     * @param  {[type]}   bottle   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    exports.throw = function (bottle, callback) {
        bottle.time = bottle.time || Date.now();
        var curClient = null,
            bottleId = Math.random().toString(16),
        //	为每个瓶子随机生成一个id
    
            type = {
                'male': 0,
                'female': 1
            };
        //	根据不同类型将不同漂流瓶保存到不同的数据库
    
        if(type[bottle.type] == 0){
            curClient = client;
        }else{
            curClient = client1;
        }
        
        console.log('现在应该选择' + type[bottle.type] + '号数据库进行插入');
    
        curClient.SELECT(type[bottle.type], function () {
            curClient.HMSET(bottleId, bottle, function (err, res) {
                //	以hash类型保存漂流瓶对象
    
                if (err) {
                    return callback({
                        'code': 0,
                        'msg': '过会再试吧!'
                    });
                }
                //	保存出错
    
                callback({
                    'code': 1,
                    'msg': res
                });
                //	保存成功
    
                curClient.EXPIRE(bottleId, 86400);
                //	设置过期时间,每个漂流瓶的生成时间为1天
            });
        });
    };

用两个redis对象,根据具体的类型判断取得那个对象,再测试就解决了这个问题。

![](http://rwson.github.io/assets/img/posts/Node-redis-3.png)

![](http://rwson.github.io/assets/img/posts/Node-redis-4.png)
