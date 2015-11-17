---
layout: post
title: NodeJs处理excel返回json
date: 2015-11-17
categories: [技术]
---

快3个月没写博客了，感觉好生疏。

由于最近在做一个乐队投票活动，每个乐队都有几个预览图片，但是运营上传图片的时候没有考虑顺序问题，后端也没做类似于拖拽排序的功能，为了快速改出来，乐队预览图的url格式是"http://api.juhuaba.com/api/file/z2/图片id",然后一想，前端可以根据指定的id的顺序来显示，然后运营那边就给了我一个excel表格，每个乐队的id和图片，然后，看了一眼excel表格，好几百条数据，感觉手动处理太烦，而且容易出错，所以就想搞个办法让程序来处理。

先上一张excel的图

![](http://rwson.github.io/assets/img/posts/excel-to-json.png)

然后开始从网上找办法，很多都是说用一个"node-xlsx"的插件，但是我试了下，可能是excel表格的问题吧，报了个很奇怪的错，就放弃了。后来去npm上找到一个"xlsx-json"的插件，试了下，确实可以取得表格里的数据做为一个数组，每一项都有，只不过如果是空单元格或者被合并的单元格都会显示null,所以还是得自己处理下。

首先肯定是执行"npm install xlsx-json"啦   
然后这个插件需要有个配置文件，暂且叫task.json吧，下面是task.json中的内容。

	[
	  {
	    "input": "data.xlsx",
	    "sheet": "Sheet1",
	    "range": "A1:C240",
	    "raw": true,
	    "output": "data.json"
	  }
	]
	//	该数组接受多个对象，每个对象的基本格式是上面那种
	//	input代表是哪个文件
	//	sheet代表一个工作簿
	//	range代表要转换的一个区域
	//	row代表逐行读取
	//	output代表输出到哪个文件

下面是调用代码

	var xlsx2json = require('xlsx-json');
	xlsx2json(task, function(err, jsonArr) {
	    if (err) {
	        console.error(err);
	        return;
	    }
	});

虽然配置了这些参数，但是读取出来的不如人意，就像下面这样：

![](http://rwson.github.io/assets/img/posts/excel-to-json2.png)

然后就对转换出来数组的进行了处理，下面是完整代码，前台浏览器访问http://localhost:3000,直接返回json给前台

    var xlsx2json = require('xlsx-json'),   //  加载xlsx-json模块
        task = require('./task.json'),      //  配置文件
        express = require("express"),
        app = express(),
        jsonData,                           //  临时变量,存储转转出来的数据
        tmpObj = {},                        //  对象,循环时用
        lastTmp = {},                       //  对象,循环用,存储每个乐队的完整对象
        result = [];                        //  由完整乐队对象构成的数组
    xlsx2json(task, function (err, jsonArr) {
        if (err) {
            console.error(err);
            return;
        }
        jsonData = jsonArr[0];
        //  返回值为[[],[],[],[]]格式,所以拿第一个
    });
    
    for (var i = 1, len = jsonData.length; i < len; i++) {
        var str = jsonData[i].join("-");
        jsonData[i] = str;
    }
    //  对转出来的数组进行遍历(从第二项,第一项是["name","id","pics"],所以不需要转换),有的前面两项是null的数组就被转换成"--第三项"了
    
    for (var j = 1, lenj = jsonData.length; j < lenj + 1; j++) {
        //  同样从第二项开始遍历,这边多循环一次由于最后一项的原因(当然也可以不多循环,直接在for外面再做个push就好)
    
        if (j == lenj) {
            result.push(lastTmp);
        }
        //  到最后一项时,放到数组里面(此时最后一项已经没有了)
    
        if (jsonData[j] && !jsonData[j].match(/\-\-/g)) {
            //  该项存在且不是前面两项为null的情况
    
            if (lastTmp.hasOwnProperty("id")) {
                result.push(lastTmp);
            }
            //  在"第二轮"循环时,把一个完整的乐队对象放到数组
    
            tmpObj = {};
            var spl = jsonData[j].split("-");
            tmpObj = {
                "id": spl[1],
                "image": [
                    spl[2]
                ]
            };
            //  给tmpObj指定id和image,其中image为数组
    
        } else if (jsonData[j] && jsonData[j].match(/\-\-/g).length) {
            //  该项存在且前面两项为null的情况,就取最后一项
    
            var tmpStr = jsonData[j].replace("--", "");
            if (tmpStr) {
                tmpObj.image.push(jsonData[j].replace("--", ""));
            }
        }
    
        lastTmp = tmpObj;
        //  把每次循环得到的乐队对象做存储
    }
    
    app.get("/", function (req, res) {
        //  配置路由,请求http://localhost:3000时,输出转换好的数据
        res.send(200, {
            "data": result
        });
    });
    
    app.listen(3000, function () {
        console.log("success!");
    });

最终返回的结果如下图所示:    
![](http://rwson.github.io/assets/img/posts/excel-to-json3.png)
