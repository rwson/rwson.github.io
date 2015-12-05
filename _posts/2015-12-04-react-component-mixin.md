---
layout: post
title: React组件的复合和mixin
date: 2015-12-04
categories: [技术]
---

在传统的HTML中，元素是构成页面的基础单元。但在React中，组件是构建页面的基础单元。我们可以把React中的组件理解成混入了javaScript表达能力的HTML元素。在React中，一个组件就相当于一个javaScript函数，它接收props和state作为参数，并且输入渲染好的DOM，组件的意义在于用来呈现和表达应用中的某一部分数据。

#### 组件的复合

我们都知道，在React中声明一个组件用React.createClass的方法，但是React并没有给我们提供一个叫React.extendClass的方法让我们来拓展或继承已经声明好的组件。我们可以通过组件复合的方法来构造一个新的组件。

下面是一个组件复用的例子：

我们现在要渲染一个选择题组件MultipeChoice，包含多个选项RadioInput。


> ##### 选项组件

先来组装HTML：

    var RadioInput = React.createClass({
        render:function(){
            return (
                <div className="redio">
                    <label>
                        <input type="radio" value="1" />
                        选项说明
                    </label>
                </div>
            );
        }
    });
    
现在一个选项的HTML就组件完成了，但是现在内容和选项的值都是写死的，所以我们需要给这个组件添加一些属性，下面继续完善这个组件：

    var RadioInput = React.createClass({
        
        //  propTypes给组件增加一个说明,标明每个prop属性的类型和是否必填
        propTypes:{
            id:React.PropTypes.string,
            name:React.PropTypes.string.isRequired,
            label:React.PropTypes.string.isRequired,
            value:React.PropTypes.string.isRequired,
            checkd:React.PropTypes.bool
        },
        
        //  getDefauleProps可以给一些非必填属性指定默认值
        getDefauleProps:function(){
            return {
                id:null,
                checked:false
            };
        }
    });
    
现在组件有了相应的props了，我们的组件需要随着时间而变化的数据，id对于每个实例来说相当重要，以及用户能随时更新的checked值，现在需要定义一些初始状态。

    var RadioInput = React.createClass({
        ...
        getInitialState:function(){
            var id = this.props.id || (new Date().getTime()).toString(32);
            //  如果没传id,就拿当前时间戳生成一个
            return {
                id:id,
                name:id,
                checked:!!this.state.checked
                //  强转成布尔值
            };
        },
        
        //  修改render方法,根据state和props重新组装HTML
        render:function(){
            return (
                <div className="redio">
                    <label>
                        <input type="radio" 
                            id={this.state.id}
                            name={this.state.name}
                            value={this.props.value}
                            checked={this.state.checked}
                        />
                        {this.props.label}
                    </label>
                </div>
            );
        }
    });
    
到此，就算完成一个选项组件的构建。

> ##### 父组件的构建及整合到父组件

现在来构建父组件MultipeChoice

    var MultipeChoice = React.createClass({
        
        //  指定一些数据类型和必须性
        propTypes:{
            value:React.PropTypes.string,
            choices:React.PropTypes.array.isRequired,
            onCompleted:React.PropTypes.func.isRequired
        },
        
        getInitialState:function(){
            return {
                id:uniqueId("mutil-choice-"),
                value:this.props.value
            };
        },
        
        render:function(){
            return (
                <div className="form-group">
                    <label className="item-label" htmlFor={this.state.id}>
                        {this.props.label}
                    </label>
                    <div className="item-content">
                        <RadioInput ... />
                        ...
                        <RadioInput ... />
                    </div>
                </div>
            );
        }
    });
    
我们假设一个RadioInput就是一个选项组件，为了生成他们，我们需要对选项列表进行映射，把每一项都转换成一个组件。

    var MultipeChoice = React.createClass({
        ...
        
        //  遍历属性中的choices数组,返回选项列表
        renderChoices:function(){
            return this.props.choices.map(function(item,index){
                return RadioInput({
                    id:"choice-" + index,
                    name:this.state.id,
                    label:choice,
                    value:choice,
                    checked:this.state.value === choice
                });
            }).bind(this);
        },
        
        render:function(){
            return (
                <div className="form-group">
                    <label className="item-label" htmlFor={this.state.id}>
                        {this.props.label}
                    </label>
                    <div className="item-content">
                        {this.renderChoices()}
                    </div>
                </div>
            );
        }
    });
    
现在使用这个组件就可以像下面这样：

    <MultipeChoice choice={arrOfChoices} ... />
    
现在又有另外一个问题，就是父子组件之间怎么通信的一个问题，放在我们现在的例子来说，子组件状态变化以后父组件不知道。

> ##### 父子组件之间的关系

父子组件通信最简单的方式就是使用props，父组件通过props传递一个回调方法，子组件在需要时进行调用。

现在我们继续改造...

先来对父组件进行改造：

    var MultipeChoice = React.createClass({
        ...
        
        //  定义的handleChanged回调方法，供子组件状态变化后调用
        handleChanged:function(value){
            this.setState({
                value:value
            });
            this.props.onCompleted(value);
        },
        
        renderChoices:function(){
            return this.props.choices.map(function(item,index){
                return RadioInput({
                    ...
                    onChanged:this.handleChanged
                });
            }).bind(this);
        },
        
        ...
    });
    
再来对子组件进行改造：

    var RadioInput = React.createClass({
        ...
        
        propTypes:{
            ...
            onChanged:React.PropTypes.bool
        },
        
        getInitialState:function(){
            var id = this.props.id || (new Date().getTime()).toString(32);
            //  如果没传id,就拿当前时间戳生成一个
            return {
                id:id,
                name:id,
                checked:!!this.state.checked
                //  强转成布尔值
            };
        },
        
        handleChanged:function(ev){
            var checked = ev.target.checked;
            this.setState({
                checked:checked
            });
            if(checked){
                this.props.onChanged(this.props.value);
            }
        },
        
        //  修改render方法,根据state和props重新组装HTML
        render:function(){
            return (
                <div className="redio">
                    <label htmlFor={this.state.id}>
                        <input type="radio" 
                        onChange={this.handleChanged}
                        />
                        {this.props.label}
                    </label>
                </div>
            );
        }
    });
    
以上就是我们一个组件复合的例子。
    
#### mixin

mixin允许我们定义可以在多个组件中公用的方法。

> ##### 什么是mixin

我们先来看一个来自React主页上的定时器组件的例子：

    var Timer = React.createClass({
        getInitialState:function(){
            return {
                secondElapsed:0
            };
        },
        tick:function(){
            this.setState({
                secondElapsed:this.state.secondElapsed + 1
            });
        },
        componentWillUnmount:function(){
            clearInterval(this.interval);
        },
        componentDidMount:function(){
            this.interval = setInterval(this.tick,1000);
        },
        render:function(){
            return (
                <div>
                    second Elapsed:{this.state.secondElapsed}
                </div>
            );
        }
    });
    
上面的代码看起来还不错，但是如果我们有多个组件要用定时器时，这时候就体现出一个代码复用性的问题，这时候就到mixin大显神威的时候了。现在来改造一个像下面一样的定时器组件：

    var IntervalMixin = function(interval){
        return {
            componentDidMount:function(){
                this._interval = setInterval(this.onTick,interval);
            },
            componentWillUnmount:function(){
                clearInterval(this._interval);
            }
        };
    };
    
    var Timer = React.createClass({
        mixins:[
            IntervalMixin(1000)
        ],
        getInitialState:function(){
            return {
                secondElapsed:0
            };
        },
        onTick:function(){
            this.setState({
                secondElapsed:this.state.secondElapsed + 1
            });
        },
        render:function(){
            return (
                <div>
                    second Elapsed:{this.state.secondElapsed}
                </div>
            );
        }
    });
    
把刚才的改进了，并且可以传入相关的时间间隔
    
mixin，可以理解成就是把一个 mixin 对象上的方法都混合到了另一个组件上，和 jQuery中$.extend 方法的作用相同。

mixin和组件中有关生命周期的方法是不冲突的，反而会被合并，也就是说他们都会被执行。

    var Component = React.createClass({
        mixins:[
            {
                getInitialState:function(){
                    return {a:1};
                }
            }
        ],
        getInitialState:function(){
            return {b:2};
        }
    });

就上上面的例子，我们在mixin中实现了一个getInitialState，同样在组件类中也实现了一个getInitialState，得到的初始state为{a:1,b:2}，如果组件类中的方法和mixin中的方法返回对象中有相同的键，React会给出一个警告。

> ##### mixin的相关执行顺序和作用

以组件中的生命周期方法为例，比如componentDidMount，会按照mixin数组中的顺序进行调用，并且最终调用组件类中的componentDisMount。

mixin是解决代码复用性最强大的工具之一，它能让我们只专注组件自身的逻辑。