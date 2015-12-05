---
layout: post
title: React中的事件
date: 2015-12-03
categories: [技术]
---

对于用户界面来说，展示最多只占整体因素的一半，另一半则是用户输入，即通过javaScript来完成人机交互。

在React中，通过将事件绑定到组件上到形式来对事件进行处理。在触发事件的同时，相关处理函数对组件对状态进行修改，再调用render方法重绘，达到响应用户输入的目的。

#### 绑定事件处理器

React的事件本质上和原生的javaScript类似，比如MouseEvent用来处理用户鼠标点击，Change用来处理表单元素的变化等，所有事件在命名上和JavaScript规范一致，并且会在相同的情况下被触发。

React绑定事件的写法和在HTML上绑定事件的写法很像，比如我们下面将绑定一个click事件:

    ...
    handleClick:function(){
        ...
    },
    render:function(){
        return (
            <button onClick={this.handleClick}>click</button>
        );
    },
    ...
    
这样，我们就完成了一个click事件的绑定，当用户点击这个按钮，handleClick将被调用，完成一些逻辑。

刚才是在JSX语法上绑定的事件，如果不用JSX，我们就需要换成下面的绑定方法:

    React.DOM.button({
        "className":"btn-click",
        "onClick":this.handleClick
    },"click");
    
    //  从React 0.12.x版本开始，推荐使用React.createElement的写法
    
此外，如果需要支持移动端触碰事件，建议加上下面的代码:

    React.initializeTouchEvents(true);
    
#### 事件和状态

如果想让一个组件随着用户的输入而改变，我们就要在事件处理函数中对这个组件的某些状态进行修改。

比如我们下面讲完成一个类似于angularJs中双向数据绑定的效果。

    var Component = React.createClass({
      handleChange: function(ev) {
        this.setState({
            value:ev.target.value
        });
      },
      render: function() {
        var value = this.state.value;
        return (
          <div>
            <input type="text" onChange={this.handleChange} />
            <span>{value}</span>
          </div>
        );
      }
    });
    
    ReactDOM.render(
      <Component />,
      document.getElementById("div")
    );
    
此时我们的输入会在两个地方显示，一个是在输入框里面，一个在输入框后面，且值都相同。

#### 更新组件的状态

更新状态完成之后组件会调用render方法进行重绘。

在React中，有两种更新组件状态的方法，一种是调用this.setState，一种是调用this.replaceState，第一种只是重新设置组件的状态，第二种会把组件原来所以的状态清除，然后用一个全新的对象来替换组件当前的状态对象，这种用起来一定要小心，因为如果替换的对象少了一个属性值或者属性值类型不同而render方法就正好用到这个属性值，那render方法就不会往下继续走了，所以很少地方使用。大多情况还是使用第一种this.setState来修改组件的状态。

