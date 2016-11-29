---
layout: post
title: javascript模块化编程-同步模式
date: 2016-11-29
categories: [javascript, 模块化]
---

在日常开发中,为了便于多人协作开发,我们通常都会采用模块化开发的模式,今天看张荣铭的《javascript设计模式》的时候,看到同步模式这一章,结合自己之前的立即,也来实现一个简单的同步模块化模式。

    const module = (() => {

        //  缓存之前声明的模块
        let modules = {};

        /**
         * [description]
         * @param  deps     依赖列表
         * @return Array
         */
        let _loadDeps = (deps) => {
            return deps.map((dep) => {
                return modules[dep];
            });
        };

        return {

            /**
             * 声明一个模块
             * @param   id      模块id
             * @param   deps    依赖数组(模块id)
             * @param   factory 构造函数
             */
            define: (id, deps, factory) => {

                //  获取依赖,并且取得模块返回的对象
                deps = _loadDeps(deps);

                deps.map(function(dep) {
                    return dep.factory.apply(window, dep.deps);
                });

                //  判断模块名是否重复
                if (modules[id]) {
                     throw new Error("module " + id + " has been declared!");
                }

                //  缓存模块
                modules[id] = {
                    id: id,
                    factory: factory,
                    deps: deps
                };
            },

            /**
             * 使用定义好的模块
             * @param   depArr  依赖数组(模块id)
             * @param   factory 构造函数
             */
            use: (depArr, factory) => {

                //  获取依赖,并且取得模块返回的对象
                depArr = depArr.map((dep) => {
                    return modules[dep].factory.apply(window, modules[dep].deps);
                });

                //  运行构造函数
                factory.apply(window, depArr);
            }

        };

    })();

下面我们声明几个模块做测试:


    //  A模块
    module.define("A", [], () => {
        return {
            method: () => {
                console.log("method under module A");
            }
        };
    });

    //  B模块
    module.define("B", [], () => {
        return {
            method: () => {
                console.log("method under module B");
            }
        };
    });

    //  Person类
    module.define("PersonClass", [], () => {

        class Person {
            constructor(name, age, sex, job) {
                this.name = name;
                this.age = age;
                this.sex = sex;
                this.job = job;
            }

            hello() {
                console.log("hello " + this.name);
            }

            eat() {
                console.log(this.name + " will eat");
            }

            getProfile() {
                return {
                    name: this.name,
                    age: this.age,
                    sex: this.sex,
                    job: this.job
                };
            }
        }

        return Person;
    });

最后我们调用module.use来使用这些模块:


    module.use(["A", "B", "PersonClass"], (A, B, PersonClass) => {

        A.method();
        B.method();

        let person = new PersonClass("rwson", 24, "male", "web developer");
        person.hello();

        setTimeout(function() {
            person.eat();
        }, 5000);

        console.log(person.getProfile());

    });

最后浏览器控制台输出如下图的结果:

![javascript模块化-同步模式](/imgs/sync-module-mode.png)

至此一个简单的模块化工具就开发完成了。
