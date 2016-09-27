---
layout: post
title: React中的数据流
date: 2015-12-02
categories: [React]
---

昨天学习完组件的生命周期，今天学习学习React中的数据流。

在React中，数据流是单向的(由父节点传递到子节点)，因此组件变得简单且易于把握，它们只需要从父节点中获取props来渲染即可，某个组件顶层的props发生改变，React会递归遍历整个组件树，并且重新渲染使用这个属性的组件。

在React组件内部，还具有自己的状态，但是只能在组件内部进行修改。

#### React中的props:

props就是properties的缩写，接收任意类型的数据。

设置组件的props有两种方法:

1. 可以在挂载组件的时候设置
    
        var surveys = [
            {
                "title":"some value"
            }
        ];
        <ListSurveys surveys={surveys} />

2.  或者调用组件实例的setProps方法
        
        var surveys = [
            {
                "title":"some value"
            }
        ];
        var listSurveys = React.render(<ListSurveys/>,document.body);
        listSurveys.setProps({"surveys":surveys});

需要注意的是，只能在子组件或者组件树外面调用setProps方法，但是不能用this.setProps，如果非要这样，可以用state来代替。

可以通过this.props来访问props，但是不能修改，组件不能对自己的props进行修改。

JSX中props的几种使用

1. 把props设置成字符串
        
        <a href="/a/b"></a>

2. 用JSX中的展开语法({...obj})把props设置成一个对象
    
        var aComponent = React.createClass({
            render:function(){
                var props = {
                        "a":"foo",
                        "b":"bar"
                };
                return (
                    <aComponent {...props} />
                );
            }
        });

3. 绑定事件

        var aComponent = React.createClass({
            handleClick:function(){
                ...
            },
            render:function(){
                return (
                    <button onClick={this.handleClick}>啦啦啦</button>
                );
            }
        });

我们给button添加了一个onClick属性,值为handleClick，当该按钮被点击，将执行handleClick方法。

PropTypes:

React中提供一个验证props的方式(通过在组件中定义一组对象)

        var aCOmponent = React.createClass({
            PropTypes:{
                survey:React.PropTypes.shape({
                    id:React.PropTypes.number.isRequired
                }).isRequired,
                onClick:React.ProTypes.func
            },
            ...
        });
        
在组件初始化时，如果指定的props和指定的类型不匹配，控制台会打出一个警告，如果不是必传的prop，可以不用isRequired，尽管这个不是必须的，但是有了它，我们将更能清楚的知道该组件对props的数据格式/必填性等要求。

getDefaultProps方法:

我们可以调用这个方法给某个组件添加props的默认值，但是这只能对非必填属性，需要注意的是，该方法在React.createClass(声明组件)的时候就被调用了，返回值将被缓存起来。

        var aCOmponent = React.createClass({
            getDefaultProps:function(){
                return {
                    survey:[]
                };
            },
            ...
        });

#### React中的state

每个组件都有自己的state，state和props的区别在与state只能存在于组件内部(前面说props可以在组件外部通过实例方法进行修改，但是不能在在组件内部用this.setProps来修改，对应state来说，只能通过this.setState来进行修改)

state可以用来确定一个元素视图的状态，比如我们在下面自定义一个dropDown组件:

    var dropDown = React.createClass({
        getInitialState:function(){
            return {
                showOptions:false
            };
        },
        render:function(){
            var options = "";
            if(this.state.showOptions){
                options = <ul className="option-item">
                    <li>option-1</li>
                    <li>option-2</li>
                    <li>option-3</li>
                    <li>option-4</li>
                </ul>;
            }
            return (
                <div className="dropDown">
                    <label onClick={this.handleClick}>select an option</label>
                    {options}
                </div>
            );
        },
        handleClick:function(){
            this.setState({
                showOptions:true
            });
        }
    });
    
在本例中，state被用来判断是否显示下拉框中的可选项。

在React中，state可以用this.setState来进行修改，也可以通过getInitialState方法提供一些默认值，只要setState被调用，render方法也会被调用，如果render的返回值有变化，DOM也会被更新，我们看到的当然也有变化。

和props类似，我们只能通过this.state来访问state，但是决不能通过这种方式对state进行修改。


---

好了，上面就是关于props和state的一个学习，下面我们介绍下props和state中应该放些什么东西

props:数据源、计算后的结果、等等

state:组件渲染时的必要数据(boolean值[控制显示隐藏等]、输入框值、等等)

同时，不要想着把props的值赋值给state
