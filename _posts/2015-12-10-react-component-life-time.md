---
layout: post
title: React组件生命周期
date: 2015-12-01
categories: [技术]
---

在React的组件生命周期中，随着该组件的props活着state发生改变，对应的DOM也随着变换，一个组件对于特定的输入，它将返回一致的输出。

在React中，对于每个组件都提供了相应的钩子去响应：
- 创建时(实例化)
- 存在期(活动期)
- 销毁期
 

---

#### 实例化

在React的一个组件被实例化时，将依次调用以下一些方法
 
    getDefaultProps:
对于某个组件类，该方法只会被调用一次。对于那些没有被父组件指定props属性的组件来说，该方法返回默认的props

    getInitialState
对于该组件的每个实例来说，该方法有且只能被调用一次，在这里，我们可以对每个组件的状态进行初始化，和getDefaultProps不同的是，getInitialState在每次被实例化时都会被调用(个人感觉这一点感觉和js面向对象中的构造方法和原型类似，getDefaultProps相当于一个原型，getInitialState相当于构造方法，然后所有实例都享有同一个原型)，由于getDefaultProps在该方法之前被调用，所以此时我们已经可以访问到this.props了
    
    componentWillMount
该方法在首次完成渲染之前被渲染，在这个方法里面，我们可以修改组件的一些state，需要注意的是，这是该组件完成实例化之前的最后一次修改
    
    render
渲染虚拟DOM，对应一个组件来说，render方法是唯一一个必须实现的，并且遵循以下特殊的几个规则：

1. 只能通过this.props和this.state来访问数据
2. 可以返回null，boolean值或者任何形式的组件
3. 只能出现一个顶级组件(不能返回多个一级标签并列)

    
    componentDidMount
组件被实例化完成(render执行成功)后调用，可以在该方法中用this.getDOMNode()来访问到该组件，在这个方法中，比如我们要运行我们自定义的一个jQuery插件时，就可以直接写在里面，但是如果React运行在服务端，该方法将不会被调用
    
    
#### 活动期

随着组件的一些状态(比如鼠标点击、键盘输入等)发生改变，将依次调用以下一些方法

    componentWillReciveProps
在任意时刻，组件的props都可以通过父辈组件来修改，此时将调用该方法，我们可以在该方法对组件的state进行更新
    
    showComponentUpdate
当props或者state发生改变，我们可以在该方法中进行比较修改前和修改后的数据，返回一个boolean值，React会根据这个来判断是否需要重新进行渲染
    
    componentWillUpdate
和上一阶段的componentWillMount类似，只不过该方法是在重新进行渲染之前被调用
    
    render
重新渲染虚拟DOM
    
    componentDidUpdate
也和componentDidMount类似，只不过是在完成重新渲染之后被调用
    
#### 销毁期
    
最后该组件被使用完成，下面的方法将会给这个组件提供自身清理的机会
    
    componentWillUnmount
比如我们在该组件中设置了一个定时器，添加了某些事件绑定等等，该方法就负责把定时器清除，移除事件监听的

以上就是React中一个组件的生命周期

---

#### 反模式:把计算后的值赋值给state

在getInitialState方法中，我们可以访问到this.props，通过this.props来创建state就是一种反模式。
比如:在组件中,把当前事件转换成字符串格式，就只能在渲染时进行
反模式的写法是不恰当的

反模式中的写法:
    
    ...
    getDefault:function(){
        return {
            "date":new Date()
        };
    },
    getInitialState:function(){
        return {
            "day":this.props.getDay()
        };
    },
    render:function(){
        return <div>Day:{this.state.day}</div>
    }
    ...
    
正常模式的写法
    
    ...
    getDefault:function(){
        return {
            "date":new Date()
        };
    },
    render:function(){
        var day = this.props.date.getDay()；
        return <div>Day:{day}</div>
    }
    ...
    
好了，博客写完了，收工，睡觉！<img src="emoji/smile" width="18"/>