---
layout: post
title: React Native自定义原生模块
date: 2016-01-12
categories: [React]
---

现如今，越来越多的移动开发者选择用React Native来开发他们的app。虽然React Native提供了强大的API供我们调用，但是对于一些功能(比如第三方支付、文件上传之类的)，原生模块中并没有提供给我们相关的API，这时候就需要我们来自己封装一些东西来给js端调用。这边以ios端的为例来介绍。


---

###### 模块配置表

在RN加载的时候，所有注册并且符合规范的模块都会被导出并且生成相应的模块数据类RCTModuleData，而模块数据中缓存了模块的对象实例，以及模块索引id。

最后大概生成一个如下的模块配置表:

    {
        "remoteModuleConfig": {
            "className": {
                "methods": {
                    "method": {
                        "type": "remote",
                        "methodID": 0
                    },
                    ...
                },
                "moduleID": 4
            },
            ...
         },
    }

###### 通信流程

先看一个js调用OC的下的方法走了哪些步骤:

![](http://rwson.github.io/assets/img/posts/progress.jpg)

1.JS端调用某个OC模块暴露出来的方法。

2.把上一步的调用分解为ModuleName,MethodName,arguments，再扔给MessageQueue处理。

3.在这一步把JS的callback函数缓存在MessageQueue的一个成员变量里，用CallbackID代表callback。在通过保存在MessageQueue的模块配置表把上一步传进来的ModuleName和MethodName转为ModuleID和MethodID。

4.把上述步骤得到的ModuleID,MethodId,CallbackID和其他参数argus传给OC。至于具体是怎么传的，后面再说。

5.OC接收到消息，通过模块配置表拿到对应的模块和方法。

6.RCTModuleMethod对JS传过来的每一个参数进行处理。

7.OC模块方法调用完，执行block回调。

8.调用到第6步说明的RCTModuleMethod生成的block。

9.block里带着CallbackID和block传过来的参数去调JS里MessageQueue的方法invokeCallbackAndReturnFlushedQueue。

10.MessageQueue通过CallbackID找到相应的JS callback方法。

11.调用callback方法，并把OC带过来的参数一起传过去，完成回调。

整个流程就是这样，简单概括下，差不多就是：JS函数调用转ModuleID/MethodID -> callback转CallbackID -> OC根据ID拿到方法 -> 处理参数 -> 调用OC方法 -> 回调CallbackID -> JS通过CallbackID拿到callback执行

下面就简单分享一个从OC暴露方法到JS端调用的例子：


    // OC(RCTDeviceExtension.m)
    
    #import "RCTBridgeModule.h"
    #import "RCTUtils.h"
    //  RCTScreenSize用到
    
    @interface RCTDeviceExtension : NSObject <RCTBridgeModule>
    
    @end
    
    @implementation RCTDeviceExtension
    
    RCT_EXPORT_MODULE();
    //  暴露一个模块
    
    /**
      获取设备的相关信息
     **/
    static NSDictionary *DynamicDimesions(){
      CGFloat width = MIN(RCTScreenSize().width,RCTScreenSize().height);
      //  宽
      CGFloat height = MAX(RCTScreenSize().width,RCTScreenSize().height);
      //  高
      CGFloat scale = RCTScreenScale();
      //  像素密度
      
      if(UIDeviceOrientationIsLandscape([UIDevice currentDevice].orientation)){
        width = MAX(RCTScreenSize().width,RCTScreenSize().height);
        height = MIN(RCTScreenSize().width,RCTScreenSize().height);
      }
      
      return @{
                @"width":@(width),
                @"height":@(height),
                @"scale":@(scale)
               };
      //  在回调方法中作为一个对象,有width,height,scale属性
      
    }
    
    RCT_EXPORT_METHOD(getDeviceInfo:(RCTResponseSenderBlock)callback){
      callback(@[[NSNull null],DynamicDimesions()]);
    };
    //  暴露方法
    
    @end
    
这里OC暴露一个类,DeviceExtension(RCTDeviceExtension被编译成DeviceExtension)，在JS端，我们就可以通过如下方式来调用相关方法。

    var DeviceExtension = require("NativeModules").DeviceExtension;
    //  require("NativeModules")用来加载原生模块(包括自定义模块)
    
    DeviceExtension.getDeviceInfo(function(err,info){
      console.log(info);
    });
    
这样我们的自定义API就实现了，后面如果再有更复杂的功能的时候，思路都是一样的，只不过步骤会更繁杂一些。