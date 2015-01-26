$(function(){
    var QQ = $("i.QQ"),
        weChat = $("i.weChat"),
        QQMask = $("div.QQ-mask"),
        closeMask = $("a.close-mask"),
        weChatMask = $("div.wechat-mask");
    QQ.click(function(){
        if(QQMask.css("display") == "none"){
            QQMask.show();
            QQMask.find(closeMask).click(function(){
                QQMask.hide();
            });
        }
        return false;
    });
    weChat.click(function(){
        if(weChatMask.css("display") == "none"){
            weChatMask.show();
            weChatMask.find(closeMask).click(function(){
                weChatMask.hide();
            });
        }
        return false;
    });
});