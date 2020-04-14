var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

import { Server } from './server';

let server = new Server(io);

http.listen(3000, function()
{
	console.log('listening on *:3000');
});