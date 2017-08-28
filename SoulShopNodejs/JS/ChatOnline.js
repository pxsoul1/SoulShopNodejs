var socket = io();//socket变量初始化
var nowContack = null;//当前的聊天对象名字
var myName = null;//我的名字
var contackList = [];//联系人数组
var myMessageRecords = {};//聊天记录类
var newMessageRecords = [];//与当前对象的新纪录数组

//新消息构造函数
function createNewMessage(type, msg) {
    var newMessage = {
        type: type,//0表示我 1表示其他人
        message: msg
    };

    return newMessage;
}

//联系人构造函数
function createContack(name, order, lastMessage) {

    var contack = {
        name: name,
        order: order,
        lastMessage: lastMessage
    };

    return contack;
}

//联系人伪造函数
function createContackForTest() {

    var i;

    for (i = 0; i < 5; i++) {
        contackList[i] = createContack("soul" + i, i, "");
    }
}

//根据当前的联系人列表数组 填充页面联系人列表和初始化聊天记录类
function fullContacksOnHtmlAndInitMR() {

    //根据联系人列表 按顺序填充 并将第一项置为当前对象
    var i;
    var length = contackList.length;
    for (i = 0; i < length; i++) {
        var theContack = contackList[i];
        //填充页面联系人
        var objLi = $('<li class="" style="background-image: url(Image/Main/img-sales7.jpg)">' +
            '<div class="chat-name">' + theContack.name + '</div>' +
            '<div class="chat-content">' + theContack.lastMessage + '</div></li>');
        if (i == 0) {
            objLi.addClass("active");
        }
        $(".chat-left-part ul").append(objLi);
        //聊天记录类初始化
        myMessageRecords[theContack.name] = [];
    }

    //设置当前联系人
    nowContack = contackList[0];
}

//根据name获取聊天对象
function getContackBaseOnName(name) {
    var i;
    var length = contackList.length;

    for (i = 0; i < length; i++) {
        if (contackList[i].name === name) {//找到该对象
            return contackList[i];
        }
    }
}

//改变当前的聊天对象
function changeNowContack(name) {

    var i;
    var length = contackList.length;

    for (i = 0; i < length; i++) {
        if (contackList[i].name === name) {//找到该对象
            nowContack = contackList[i];
        }
    }
}/*2*/

//发送文本框中内容至目标
function sendMessageToContack() {
    var objTextarea = $("#chatInputContent");
    //将当前信息显示至自己的聊天窗口
    addMyMessageLi(objTextarea.val());
    //根据当前聊天对象名字 和 当前聊天信息 进行数据
    //格式为"联系人用户名" + ":" + "msg" + ":" + 发件人用户名
    socket.emit('chat message', nowContack.name + ":" + objTextarea.val() + ":" + myName);//将数据发送至socket服务器
    objTextarea.val("");
}

//将与当前聊天对象新纪录数组中的聊天记录 记录至聊天记录类
function saveNewMessagesToMyData() {
    var nowContackMessages = myMessageRecords[nowContack.name];
    //判断纪录类是否有当前聊天对象的记录存在
    if (nowContackMessages) {//若存在 不执行操作
    } else {//若不存在 创建一个数组
        nowContackMessages = [];
    }

    //将新聊天记录存入聊天记录类
    var i;
    var length = newMessageRecords.length;
    for (i = 0; i < length; i++) {
        //添加数据到数组末尾
        nowContackMessages.push(newMessageRecords[i]);
    }
    //新消息数组置空
    newMessageRecords = [];
}/*1*/

//根据当前聊天对象取数据刷新聊天记录
function UpdateShowMessageBaseOnNowContack() {
    $(".chat-body ul li").remove();//删除原窗口中的聊天数据
    //根据聊天记录类中保存数据 填充聊天窗口
    var nowContackMessages = myMessageRecords[nowContack.name];
    var length = nowContackMessages.length;
    var i;
    for (i = 0; i < length; i++) {
        var theMsg = nowContackMessages[i];
        if (theMsg.type) {//其他人
            addOtherMessageLi(theMsg.message);
        } else {//我
            addMyMessageLi(theMsg.message);
        }
    }
}/*3*/

//添加我方信息
function addMyMessageLi(msg) {
    var objLi = $('<li class="chat-message-mine" style="background-image: url(Image/Main/img-sales7.jpg)"></li >');
    objLi.append($('<div>').text(msg))
    $(".chat-body ul").append(objLi);
}

//添加对方信息
function addOtherMessageLi(msg) {
    var objLi = $('<li class="chat-message-others" style="background-image: url(Image/Main/img-sales7.jpg)"></li >');
    objLi.append($('<div>').text(msg))
    $(".chat-body ul").append(objLi);
}

//将数据填入新纪录数组
function addNewMsgToNewMsgRec(type, msg) {
     newMessageRecords.push(createNewMessage(type, msg));
}

//设置非当前聊天对象的新消息顶置 并设置提示
function setNMsgNotTheContackTop(senderName) {
    var objContackLis = $(".chat-left-part ul li");
    var objWaittingMove = objContackLis.filter(function () {
        if ($(this).find(".chat-name").text() == senderName) {
            return true
        }
        return false;
    });

    objWaittingMove.insertBefore($(objContackLis[0]));
}

$(function () {
    //侧栏展开与收缩
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

    //聊天输入区域焦点事件
    $(".chat-input textarea").focus(function () {
        $(".chat-input").addClass("active");
    });
    $(".chat-input textarea").blur(function () {
        $(".chat-input").removeClass("active");
    });

    //聊天工具栏工具图标高度
    var objToolsIcon = $(".chat-input .chat-input-tools > div");
    objToolsIcon.width(objToolsIcon.height());

    //1.ajax获取当前用户聊天列表 填充联系人列表
    //2.初始化当前聊天对象名字
    createContackForTest();
    fullContacksOnHtmlAndInitMR();

     //3.联系人列表监听相应 设置当前聊天对象名字
    //联系人列表点击事件
    var objPeopleLi = $(".chat-left-part ul li");
    objPeopleLi.click(function () {
        if ($(this).hasClass("active")) {

        } else {
            objPeopleLi.removeClass("active");
            $(this).addClass("active");
            //改变当前的聊天对象
            saveNewMessagesToMyData();
            changeNowContack($(this).find(".chat-name").text());
            UpdateShowMessageBaseOnNowContack();
        }
    });

    //4.ajax获取当前的用户名与socket进行绑定
    $("#saveContackInfoBtn").click(function () {
        //根据输入的名字进行设置
        myName = $("#myNameInput").val();
        //初始化我的名字和socket的绑定
        socket.emit('init', myName);
    });

    //socket.io事件监听
    $("#sendBtn").click(function () {//发送按钮点击事件
        var msg = $("#chatInputContent").val();;//将输入数据填入新聊天记录数组中
        addNewMsgToNewMsgRec(0, msg);
        sendMessageToContack();//将输入数据填入聊天窗口
        nowContack.lastMessage = msg;//将与当前联系的最后一条消息重置
    });

    $("#chatInputContent").keyup(function (event) { //文本区回车事件响应
        if (event.keyCode == 13) {
            var msg = $("#chatInputContent").val();//将输入数据填入新聊天记录数组中
            addNewMsgToNewMsgRec(0, msg);
            sendMessageToContack();//将输入数据填入聊天窗口
            nowContack.lastMessage = msg;//将与当前联系的最后一条消息重置
        }
    });

    socket.on('chat message', function (msg) {//服务器消息传回数据
        //解析传回的数据
        var msgArray = msg.split(":");
        var senderName = msgArray[0];//发件人姓名
        var msgContent = msgArray[1];//发件人消息
        if (senderName == nowContack.name) {//如果发件人为当前聊天对象
            addNewMsgToNewMsgRec(1, msgContent);//将传回数据填入新聊天记录数组中
            addOtherMessageLi(msgContent);//将传回的数据填入聊天窗口
            nowContack.lastMessage = msg;//将与当前联系的最后一条消息重置
        } else {//如果发件人不为当前聊天对象
            myMessageRecords[senderName].push(createNewMessage(1, msgContent));//将信息存入聊天记录类
            var theContack = getContackBaseOnName(senderName);
            theContack.lastMessage = msgContent;//将与当前联系的最后一条消息重置
            setNMsgNotTheContackTop(senderName);//置顶该联系人
        }
    });
});