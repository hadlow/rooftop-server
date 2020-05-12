"use strict";
exports.__esModule = true;
var Helper = require("./helpers");
var db_1 = require("./db");
var Server = /** @class */ (function () {
    function Server(io) {
        var _this = this;
        this.io = io;
        this.db = new db_1.DB();
        this.io.on('connection', function (socket) {
            _this.create(socket);
            _this.join(socket);
            _this.move(socket);
            _this.group(socket);
            _this.message(socket);
            _this.leave(socket);
        });
    }
    Server.prototype.create = function (socket) {
        var _this = this;
        socket.on('create', function (data) {
            var room = {
                id: Helper.roomId(),
                password: "",
                background: "",
                host: socket.id
            };
            var client = {
                id: socket.id,
                room: room.id,
                group: "",
                x: 200,
                y: 200
            };
            _this.db.setClient(client, function () {
                _this.db.setRoom(room, function () {
                    _this.db.addClientToRoom(room.id, client.id, function () {
                    });
                });
            });
            socket.emit('created', client);
            // Join room
            socket.join(room.id);
        });
    };
    Server.prototype.join = function (socket) {
        var _this = this;
        socket.on('join', function (data) {
            // If room doesn't exist then let the client know
            _this.db.roomExists(data.room, function (error, roomExists) {
                if (!roomExists)
                    return socket.emit('error', "Room not found");
                _this.db.getRoom(data.room, function (error, room) {
                    var mirror = {
                        id: socket.id,
                        room: room.id,
                        group: "",
                        x: Math.floor(Math.random() * Math.floor(400)),
                        y: Math.floor(Math.random() * Math.floor(400))
                    };
                    _this.db.setClient(mirror, function () {
                        _this.db.addClientToRoom(room.id, mirror.id, function () {
                            _this.db.getClientsForRoom(room.id, function (error, clientIds) {
                                _this.db.getClients(clientIds, function (clients) {
                                    socket.emit('joined', { "mirror": mirror, "clients": clients });
                                });
                                // Let everyone in that room know they've joined
                                _this.io.to(room.id).emit('new', mirror);
                            });
                        });
                    });
                });
                // Join room
                socket.join(data.room);
            });
        });
    };
    Server.prototype.move = function (socket) {
        var _this = this;
        socket.on('move', function (data) {
            // If room doesn't exist then let the client know
            _this.db.roomExists(data.room, function (error, roomExists) {
                if (!roomExists)
                    return socket.emit('error', "Room not found");
                /*
                this.db.getRoom(data.room, (error, room) =>
                {

                });
                */
                _this.db.updateClientLocation(data.client, data.location[0], data.location[1], function () {
                    // Let everyone in that room know they've moved
                    _this.io.to(data.room).emit('moved', { "id": data.client, "location": [data.location[0], data.location[1]] });
                });
            });
        });
    };
    Server.prototype.group = function (socket) {
        var _this = this;
        socket.on('group.create', function (data) {
            // If room doesn't exist then let the client know
            _this.db.roomExists(data.room, function (error, roomExists) {
                if (!roomExists)
                    return socket.emit('error', "Room not found");
                var group = Helper.guid();
                _this.db.updateClientGroup(data.client, group, function () {
                    // Let everyone in that room know they've moved
                    _this.io.to(data.room).emit('grouped', { "client": data.client, "group": group });
                });
                _this.db.updateClientGroup(data.joining, group, function () {
                    // Let everyone in that room know they've moved
                    _this.io.to(data.room).emit('grouped', { "client": data.joining, "group": group });
                });
            });
        });
        socket.on('group.join', function (data) {
            // If room doesn't exist then let the client know
            _this.db.roomExists(data.room, function (error, roomExists) {
                if (!roomExists)
                    return socket.emit('error', "Room not found");
                _this.db.updateClientGroup(data.client, data.group, function () {
                    // Let everyone in that room know they've moved
                    _this.io.to(data.room).emit('grouped', { "client": data.client, "group": data.group });
                });
            });
        });
    };
    Server.prototype.message = function (socket) {
        var _this = this;
        socket.on('message', function (data) {
            // If room doesn't exist then let the client know
            _this.db.roomExists(data.room, function (error, roomExists) {
                if (!roomExists)
                    return socket.emit('error', "Room not found");
                _this.io.to(data.room).emit('message', { "id": data.client, "message": data.message });
            });
        });
    };
    Server.prototype.leave = function (socket) {
        var _this = this;
        socket.on('disconnect', function () {
            // Get client
            _this.db.getClient(socket.id, function (error, client) {
                if (client) {
                    // Get room of client
                    _this.db.getRoom(client.room, function (error, room) {
                        // Let everyone in that room know they've left
                        _this.io.to(room.id).emit('leave', client.id);
                        // If client is room host
                        if (room.host == client.id) {
                            // Remove room
                            //this.db.removeRoom(room);
                        }
                        // Remove client from redis
                        _this.db.removeClient(client);
                    });
                }
            });
        });
    };
    return Server;
}());
exports.Server = Server;
