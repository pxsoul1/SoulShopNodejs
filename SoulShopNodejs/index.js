var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var session = require('express-session');

var path = require('path');
var pathName = __dirname;

//全局变量
var userSockets = {};//根据用户名保存socketId
var sockets = {};//根据socketId获取socket

app.use(express.static(pathName));//静态资源文件目录设置

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/ChatOnline.html');
});

//socket.io连接
io.on('connection', function (socket) {
    
    //将当前用户的socket,id和用户名绑定
    socket.on('init', function (name) {
        userSockets[name] = socket.id;
        sockets[socket.id] = socket;
        console.log('a user connected socketid: ' + name + ':' + userSockets[name]);
    });

    //客户端断开事件
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    //chat message事件接收
    socket.on("chat message", function (msg) {//接收来自客户端的数据
        //1.解析来自客户端的数据
        var contackArray = msg.split(":");
        var contackName = contackArray[0];//联系人姓名
        var contackMsg = contackArray[1];//联系人信息
        var senderName = contackArray[2];//发件人姓名 
        var toSocketId = userSockets[contackName];//获取对应的socketId
        //2.将该信息发送至指定联系人处
        //var toSocket = _.findWhere(io.sockets.sockets, { id: toSocketId });//根据id获取指定的Socket
        var toSocket = sockets[toSocketId];
        //发送至客户端信息格式 senderName + ":" + contackName
        if (!(toSocket == undefined)) 
            toSocket.emit('chat message', senderName + ":" + contackMsg);
        //io.emit('chat message', msg);//广播：将客户端数据发送至源客户端和其他客户端（用于聊天窗口）
    });
});

//设置监听端口
http.listen(3000, function () {
    console.log('listening on *:3000');
});
