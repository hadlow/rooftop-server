"use strict";
exports.__esModule = true;
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var server_1 = require("./server");
var server = new server_1.Server(io);
http.listen(3000, function () {
    console.log('listening on *:3000');
});
