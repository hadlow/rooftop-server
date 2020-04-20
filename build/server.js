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
            console.log("Joinging: " + socket.id);
            _this.create(socket);
            _this.join(socket);
            _this.move(socket);
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
                x: 0,
                y: 0
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
                        x: 0,
                        y: 0
                    };
                    _this.db.setClient(mirror, function () {
                        _this.db.addClientToRoom(room.id, mirror.id, function () {
                        });
                    });
                    _this.db.getClientsForRoom(room.id, function (error, clientIds) {
                        //console.log("client ids: ");
                        //console.log(clientIds);
                        _this.db.getClients(clientIds, function (clients) {
                            //console.log("clients: ");
                            //console.log(clients);
                            socket.emit('joined', { "mirror": mirror, "clients": clients });
                        });
                        // Let everyone in that room know they've joined
                        _this.io.to(room.id).emit('new', mirror);
                    });
                });
                // Join room
                socket.join(data.room);
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
    Server.prototype.move = function (socket) {
        /*
        socket.on('move', (data) =>
        {
            if(!(data.room in this.rooms))
            {
                socket.emit('error', "Room not found");

                return;
            }

            let room = this.rooms[data.room];

            room.updateClientLocation(data.client, data.location[0], data.location[1]);

            // Let everyone in that room know they've moved
            for(let client of room.getClients())
            {
                if(client.getId() == data.client)
                    break;
                
                client.getConnection().emit('moved', {"id": client.getId(), "location": [data.location[0], data.location[1]]});
            }
        });
        */
    };
    return Server;
}());
exports.Server = Server;
