var socket = io();//socket变量初始化
var nowContack = null;//当前的聊天对象名字
var nowTheContack = null;//当前的聊天对象
var myName = null;//我的名字
var myIcon = null;//我的头像
var contackList = [];//联系人数组
var myMessageRecords = {};//聊天记录类
var newMessageRecords = [];//与当前对象的新纪录数组
//var urlbase = "http://www.pxsoul.cn/Shop/Shop/";
var urlbase = "http://localhost:1898/Shop/Shop/";

//新消息构造函数
function createNewMessage(type, msg, isRead) {
    var newMessage = {
        type: type,//0表示我 1表示其他人
        message: msg,
        isRead: isRead
    };

    return newMessage;
}

//联系人构造函数
function createContack(name, order, lastMessage, headIcon, nickName) {

    var contack = {
        name: name,
        order: order,
        lastMessage: lastMessage,
        headIcon: headIcon,
        nickName: nickName
    };

    return contack;
}

//联系人获取函数
function getListContacks() {

    $.ajax({
        type: "get",
        url: urlbase + "GetConackList",
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            "myName": myName
        },
        success: function (data) {
            var listContacks = eval(data);
            var length = listContacks.length;
            for (i = 0; i < length; i++) {
                var contack = listContacks[i];
                var headIcon = contack.HeadIcon;
                if (headIcon == null || headIcon == "") {
                    headIcon = "/Icon/NavView/店铺.png";
                }
                contackList[i] = createContack(contack.ConackName, i, "", headIcon, contack.ReNickName);
            }
            fullContacksOnHtmlAndInitMR();//将联系人填充至html
            setClickListenerForContackList();//设置监听
        }
    })
}

//根据当前的联系人列表数组 填充页面联系人列表和初始化聊天记录类
function fullContacksOnHtmlAndInitMR() {

    //根据联系人列表 按顺序填充 并将第一项置为当前对象
    var i;
    var length = contackList.length;
    for (i = 0; i < length; i++) {
        var theContack = contackList[i];
        //填充页面联系人
        var objLi = $('<li class="" style="background-image: url(' + theContack.headIcon + ')">' +
            '<div class="chat-name">' + theContack.nickName + '</div>' +
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
    //初始化 聊天记录类数据
    initMRByServer();
}

//根据联系人列表将聊天纪录类初始化 ajax获取聊天记录
function initMRByServer() {

    //将contackList中的联系人姓名转换为参数字符串
    var length = contackList.length;
    var contacksName = "";
    for (i = 0; i < length; i++) {
        contacksName += "'" + contackList[i].name + "'";
        if (i < length - 1) {
            contacksName += ",";
        }
    }

    $.ajax({
        type: "get",
        url: urlbase + "GetChatItemsByContacks",
        dataType: 'jsonp',
        data: {
            "contacksName": contacksName
        },
        jsonp: 'callback',
        success: function (data) {
            var listContacksChat = eval(data);// listContacksChat [ { name,listChats } ]
            //将获取的数据存入本地聊天记录类中
            var contackslength = listContacksChat.length;
            var i;
            for (i = 0; i < contackslength; i++) {
                //获取theContack的聊天记录
                var contackChats = listContacksChat[i];
                var name = contackChats.ContackName;
                var chatsLength = contackChats.ListChatOnline.length;
                var j;

                for (j = 0; j < chatsLength; j++) {
                    //遍历theContack的聊天记录
                    var chat = contackChats.ListChatOnline[j];
                    var type = 1;//其他人
                    if (chat.SenderName == myName) {
                        type = 0;//我
                    }
                    //将数据放入聊天记录类
                    
                    myMessageRecords[name].push(createNewMessage(type, chat.Contents, chat.IsChecked));

                    if (j == chatsLength - 1) {//如果为最后一条记录
                        if (!chat.IsChecked && chat.SenderName != myName) {//如果该记录为未读记录 说明有新信息未读
                            //顶置该联系人信息 并添加未读标记
                            setNMsgNotTheContackTop(name, 0);
                        }
                        var objli = getContackLi(name);
                        objli.find(".chat-content").text(chat.Contents);
                    }
                }              
            }
            //初始化当前对象的聊天记录
            UpdateShowMessageBaseOnNowContack();
        }
    });
   
}

//对联系人列表项进行监听设置
function setClickListenerForContackList() {
    var objPeopleLi = $(".chat-left-part ul li");
    objPeopleLi.click(function () {

        if ($(this).hasClass("has-notread-info")) {//如果该条目有未读标识
            $(this).removeClass("has-notread-info");//去除未读标识
            var contackName = $(this).find(".chat-name").text();
            //根据选择的Li对应的聊天对象用户名 和 当前用户的用户名 将原标记为为读的数据 标记为已读
            updateChatsIsRead(contackName);
        }

        if ($(this).hasClass("active")) {

        } else {
            objPeopleLi.removeClass("active");
            $(this).addClass("active");
            //改变当前的聊天对象
            saveNewMessagesToMyData();//保存聊天记录至聊天记录类
            changeNowContack($(this).find(".chat-name").text());//改变当前的聊天记录
            UpdateShowMessageBaseOnNowContack();//更新聊天信息窗口数据
        }
    });
}

//根据联系人 设置消息已读
function updateChatsIsRead(contackName) {
    $.ajax({
        type: "get",
        url: urlbase + "ChangeChatReadSign",
        dataType: 'jsonp',
        data: {
            "myName": myName,
            "contackName": contackName
        },
        success: function (data) {
        }
    });
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
        if (contackList[i].nickName === name) {//找到该对象
            nowContack = contackList[i];
        }
    }
}/*2*/

//发送文本框中内容至目标 
function sendMessageToContack() {
    var objTextarea = $("#chatInputContent");
    //将当前信息显示至自己的聊天窗口
    addMyMessageLi(objTextarea.val());
    setScrollBottom();
    //根据当前聊天对象名字 和 当前聊天信息 进行数据
    //格式为"联系人用户名" + ":" + "msg" + ":" + 发件人用户名
    socket.emit('chat message', nowContack.name + ":" + objTextarea.val() + ":" + myName);//将数据发送至socket服务器
    saveTheMsgToServer(nowContack.name, myName, objTextarea.val());//保存数据至服务器
    objTextarea.val("");
}

//将聊天数据保存至服务器
function saveTheMsgToServer(contackName, myName, contents) {
    $.ajax({
        type: "get",
        url: urlbase + "SaveMsgToServer",
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            "contackName": contackName,
            "myName": myName,
            "contents": contents
        },
        success: function (data) {

        }
    });
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
    if (nowContack == undefined) {
        return;
    }

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
    setScrollBottom();
}/*3*/

//添加我方信息
function addMyMessageLi(msg) {
    var objLi = $('<li class="chat-message-mine" style="background-image: url(' + myIcon + ')"></li >');
    objLi.append($('<div>').text(msg))
    $(".chat-body ul").append(objLi);
}

//添加对方信息
function addOtherMessageLi(msg) {
    var objLi = $('<li class="chat-message-others" style="background-image: url(' + nowContack.headIcon + ')"></li >');
    objLi.append($('<div>').text(msg))
    $(".chat-body ul").append(objLi);
}

//将数据填入新纪录数组
function addNewMsgToNewMsgRec(type, msg, isRead) {
    newMessageRecords.push(createNewMessage(type, msg, isRead));
}

//设置非当前聊天对象的新消息顶置、设置最新消息、设置提示
function setNMsgNotTheContackTop(senderName, type/*0为设置未读，1为不设置未读*/) {
    var objContackLis = $(".chat-left-part ul li");
    var objWaittingMove = getContackLi(senderName);

    if (!type){
        setHasNotReadStatus(objWaittingMove);//添加未读状态
    }
    objWaittingMove.find(".chat-content").text(getContackBaseOnName(senderName).lastMessage);//更新最新信息
    objWaittingMove.insertBefore($(objContackLis[0]));//li插入顶
}

function getContackLi(senderName) {
    var objContackLis = $(".chat-left-part ul li");
    var objWaittingMove = objContackLis.filter(function () {
        if ($(this).find(".chat-name").text() == senderName) {
            return true
        }
        return false;
    });

    return objWaittingMove;
}

//添加未读状态
function setHasNotReadStatus(objLi/*li对象*/) {
    objLi.addClass("has-notread-info");
}

//设置消息框滚动条至最底部
function setScrollBottom() {
    var objChatBody = $(".chat-body");
    var objChatBodyDom = (document.getElementsByClassName("chat-body"))[0];
    var scrollHeight = objChatBodyDom.scrollHeight;
    objChatBody.scrollTop(scrollHeight);
}

//为联系人添加lastMessage数据
function setContackLastMsg(msg/*字符串msg*/, contack/*联系人对象*/) {
    contack.lastMessage = msg;
}

//ajax获取个人信息 及 进行后续操作
function getUserInfo() {
    $.ajax({
        type: "get",
        url: urlbase + "GetUserInfo",
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function (data) {
            if (data.code == 1) {
                var nickName = data.nickName
                var icon = data.icon;
                //$(".my-nickname").text(nickName);
                $(".my-icon").attr("src", icon);
                myIcon = icon;
                if (myIcon == "" || myIcon == undefined || myIcon == null) {
                    myIcon = "/Icon/NavView/店铺.png";
                }
                myName = nickName;
                //根据获取的用户名 获取联系人列表
                getListContacks();
                //初始化我的名字和socket的绑定
                socket.emit('init', myName);
            } else {
                alert("未获取用户信息")
            }
        }
    })
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

    //个人资料查看
    $(".chat-mine").click(function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
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

    //0.获取当前用户信息
    //1.ajax获取当前用户聊天列表 填充联系人列表
    //2.初始化当前聊天对象名字
    //3.联系人列表监听相应 设置当前聊天对象名字
    //联系人列表点击事件
     //4.ajax获取当前的用户名与socket进行绑定
    getUserInfo();

    //socket.io事件监听
    $("#sendBtn").click(function () {//发送按钮点击事件
        var msg = $("#chatInputContent").val();//将输入数据填入新聊天记录数组中
        addNewMsgToNewMsgRec(0, msg, 0);//添加聊天记录
        sendMessageToContack();//将输入数据填入聊天窗口和发送给目标联系人
        setContackLastMsg(msg, nowContack);//将与当前联系的最后一条消息重置
        setNMsgNotTheContackTop(nowContack.name, 1);//置顶该联系人
    });

    $("#chatInputContent").keyup(function (event) { //文本区回车事件响应
        if (event.keyCode == 13) {
            var msg = $("#chatInputContent").val();//将输入数据填入新聊天记录数组中
            addNewMsgToNewMsgRec(0, msg, 0);//添加聊天记录
            sendMessageToContack();//将输入数据填入聊天窗口和发送给目标联系人
            setContackLastMsg(msg, nowContack);//将与当前联系的最后一条消息重置
            setNMsgNotTheContackTop(nowContack.name, 1);//置顶该联系人
        }
    });

    socket.on('chat message', function (msg) {//服务器消息传回数据
        //解析传回的数据
        var msgArray = msg.split(":");
        var senderName = msgArray[0];//发件人姓名
        var msgContent = msgArray[1];//发件人消息
        if (senderName == nowContack.name) {//如果发件人为当前聊天对象
            addNewMsgToNewMsgRec(1, msgContent, 1);//将传回数据填入新聊天记录数组中
            addOtherMessageLi(msgContent);//将传回的数据填入聊天窗口
            setContackLastMsg(msgContent, nowContack);//将与当前联系的最后一条消息重置
            setNMsgNotTheContackTop(senderName, 1);//置顶该联系人
            setScrollBottom();//将聊天窗口的滚动条置底
            updateChatsIsRead(nowContack.name);//即时接收到消息 设置已读
        } else {//如果发件人不为当前聊天对象
            myMessageRecords[senderName].push(createNewMessage(1, msgContent, 0));//将信息存入聊天记录类
            setContackLastMsg(msgContent, getContackBaseOnName(senderName));//设置联系人最后信息
            setNMsgNotTheContackTop(senderName, 0);//置顶该联系人
        }
    });
});