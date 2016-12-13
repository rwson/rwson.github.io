---
layout: post
title: Shadow DOM研究
date: 2016-12-12
categories: [javascript, Shadow DOM, Web Component]
---

在[Polymer](https://github.com/Polymer/polymer)中,提出了[Web Component](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)的概念,旨在让开发者可以封装出很多可复用的组件。现在,webkit添加了对该API支持,也就意味着我们不用借助框架,也可以自己封装出可复用的组件(通过自定义元素的形式),而不需要依赖其他框架来实现。

假设我们这边需要封装一个进度条组件,实现代码大概是这样的:

    //  javascript
    
    "use strict";

    class CustomProgressBar extends HTMLElement {

    	constructor(args) {
    		super(args);
    
            //  createShadowRoot用来创建一个shadowDOM实例
    		const shadowRoot = this.createShadowRoot();
    
            //  设置组件内的布局结构和样式
            shadowRoot.innerHTML = `
                <style type="text/css">
                    :host {
                        display: inline-block;
                        width: 200px;
                        height: 30px;
                        box-sizing: border-box;
                        padding: 1px;
                    }
                    :host * {
                        -webkit-touch-callout: none;
                        -webkit-user-select: none;
                        -khtml-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                    }
                    .progress {
                        display: inline-block;
                        width: 200px;
                        height: 30px;
                        position: relative;
                        border: 1px solid #000;
                    }
                    .progress > .bar {
                        background: red;
                        height: 100%;
                        width: 0;
                        transition: all 0.2s;
                    }
                    
                    .progress .label {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        text-align: center;
                        font-size: 14px;
                        line-height: 30px;
                        color: #000;
                    }
                </style>
                <div class="progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                    <div class="bar"></div>
                    <div class="label">0%</div>
                </div>
            `;
    
            //  将相关元素存储到成员变量中
            this._progressElement = shadowRoot.querySelector(".progress");
            this._bar = shadowRoot.querySelector(".bar");
            this._label = shadowRoot.querySelector(".label");
    	}
    
        /**
         * 取得当前进度
         * @return {string}
         */
        get progress() {
            return Number(this._progressElement.getAttribute("aria-valuenow"));
        }
    
        /**
         * 设置进度
         * @param value
         */
        set progress(value) {
            //  最大值值最小值
            const max = this._progressElement.getAttribute("aria-valuemax"),
                  min = this._progressElement.getAttribute("aria-valuemin");
    
            //  类型判断
            if(Number.isNaN(Number(value))) {
                throw new Error(`value must be an number type, you specified ${value} which is ${{}.toString.call(value).slice(8, -1).toLowerCase()}!`);
            }
    
            //  范围检测
            if(value > max || value < min) {
                throw new Error(`value must between ${min} to ${max} , you specified ${value}!`);
            }
    
            //  设置相关属性
            this._progressElement.setAttribute("aria-valuenow", value);
            this._bar.style.width = `${value}%`;
            this._label.textContent = `${value}%`;
        }
    
        /**
         * 提供可以绑定onclick的接口
         * @param callback
         */
        set onclick(callback) {
            if(typeof callback === "function") {
                this._progressElement.addEventListener("click", e => {
                    callback.call(this, e);
                }, false);
            }
        }

    }

    //  调用 customElements.define定义自定义元素,第一个参数自定义元素名,第二个参数是HTMLElement的一个子类
    customElements.define("custom-progress-bar", CustomProgressBar);

    window.onload = () => {
    
        let customProgressBar = document.querySelector("custom-progress-bar"),
            progress;
    
        /**
         * 给进度条组件绑定onclick事件,每次点击进度加10
         * @param e
         */
        customProgressBar.onclick = (e) => {
            progress = Number(this.progress);
            if(progress >= 100) {
                progress = 0;
            } else {
                progress += 10;
            }
            this.progress = progress;
        };
    
    };

    //  HTML
    //  现在我们可以通过new CustomProgressBar()或者custom-progress-bar来使用自定义元素了
    
    <custom-progress-bar></custom-progress-bar>
    
至此我们的一个进度条组件就算封装完成了,需要注意的是,customElements.define方法对第一个参数有一些要求:

- 必须以小写字母 a-z 开头
- 不能包含大写字母 A-Z
- 必须包含"-"

最后渲染出来是如下的布局结构:

![](/imgs/shadow-dom-rendered.png)

一起看看实际的效果:

![](/imgs/shadow-dom-gif.gif)
