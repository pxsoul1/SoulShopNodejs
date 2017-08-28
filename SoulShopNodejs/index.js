var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var session = require('express-session');

var path = require('path');
var pathName = __dirname;

app.use(express.static(pathName));//静态资源文件目录设置

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/ChatOnline.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    //客户端断开事件
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    //chat message事件接收
    socket.on("chat message", function (msg) {
        //console.log("message: " + msg);
        io.emit('chat message', msg);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
