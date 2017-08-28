$(function () {
    $(".chat-people").click(function () {
        var objLeft = $(".chat-left-part");//侧栏
        var objChat = $(".chat-wrap");//聊天栏
        if(!objLeft.hasClass("shrink")) {
            objLeft.addClass("shrink");//收缩
            objChat.addClass("full");//展开
        } else {
            objLeft.removeClass("shrink");//展开
            objChat.removeClass("full");//收缩
        }
    });

    $(".chat-input textarea").focus(function () {
        $(".chat-input").addClass("active");
    });

    $(".chat-input textarea").blur(function () {
        $(".chat-input").removeClass("active");
    });

    var objToolsIcon = $(".chat-input .chat-input-tools > div");
    objToolsIcon.width(objToolsIcon.height());

    var objPeopleLi = $(".chat-left-part ul li");
    objPeopleLi.click(function () {
       if($(this).hasClass("active")) {

       } else {
           objPeopleLi.removeClass("active");
           $(this).addClass("active");
       }
    });
});