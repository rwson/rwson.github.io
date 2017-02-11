---
layout: post
title: 实现一个拷贝文件夹以及文件夹下所有文件的方法
date: 2017-01-20
categories: [nodejs, 文件操作]
---

实现这个方法依赖了[fs-extra](https://www.npmjs.com/package/fs-extra)模块,实现目的是为了一个方法拷贝所有当前目录下所有文件,具体实现如下:


    let fs = require("fs-extra");
    
    /**
     * 批量拷贝文件
     * @param src           源目录          String
     * @param target        目标目录        String
     * @param filetypes     文件类型        RegExp
     * @param ignorefiles   忽略文件列表    Array
     **/
    fs.copyAllFiles = (src, target, filetypes, ignorefiles) => {
        let argus = arguments,
            readSrc = src,
            targetSrc = target,
            fileSrc, targeFileSrc;
    
        fs.readdir(readSrc, (ex, files) => {
            if (files.length) {
                files.forEach((file) => {
                
                    //  当前文件不在忽略列表中
                    if (!(~ignoreFiles.indexOf(file))) {
                        fileSrc = path.resolve(readSrc, file);
                        if (filetypes.test(file)) {
                            targeFileSrc = path.resolve(targetSrc, file);
                            fs.copySync(fileSrc, targeFileSrc);
                        } else {
                            targeFileSrc = path.resolve(targetSrc, file);
                            fs.copySync(fileSrc, targeFileSrc);
                            //  递归拷贝下一级目录
                            fs.copyAllFiles.call(fileSrc, targeFileSrc, filetypes, ignorefiles);
                        }
                    }
                });
            }
        });
    };

上面的就是要实现的方法,调用的方法就看起来像下面的样子:


    const ignoreFiles = [".DS_Store", ".idea", ".git", ".svn"];
    fs.copyAllFiles("a", "b", /\.jpe?g|\.png/, ignoreFiles);


