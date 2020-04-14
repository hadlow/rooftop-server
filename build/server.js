"use strict";
exports.__esModule = true;
var client_1 = require("./client");
var room_1 = require("./room");
var Server = /** @class */ (function () {
    function Server(io) {
        var _this = this;
        this.rooms = {};
        io.on('connection', function (socket) {
            console.log('client connected: ' + socket.id);
            _this.create(socket);
            _this.join(socket);
            // Disconnect the socket
            socket.on('disconnect', function () {
            });
        });
    }
    Server.prototype.create = function (socket) {
        var _this = this;
        socket.on('create', function (data) {
            var client = new client_1.Client(socket);
            var room = new room_1.Room();
            room.addClient(client);
            _this.rooms[room.getId()] = room;
            var payload = {
                "client": client.getId(),
                "room": room.getId()
            };
            socket.emit('created.success', payload);
        });
    };
    Server.prototype.join = function (socket) {
        var _this = this;
        socket.on('join', function (data) {
            var client = new client_1.Client(socket);
            if (!(data.room in _this.rooms)) {
                socket.emit('joined.error', "Room not found");
                return;
            }
            var room = _this.rooms[data.room];
            room.addClient(client);
            var payload = {
                "id": client.getId(),
                "room": room.getId(),
                "clients": room.serializeClients()
            };
            socket.emit('joined.success', payload);
            // Let everyone in that room know they've joined
            for (var _i = 0, _a = room.getClients(); _i < _a.length; _i++) {
                var otherClient = _a[_i];
                if (otherClient.getId() == client.getId())
                    break;
                otherClient.getConnection().emit('new', { "id": client.getId() });
            }
        });
    };
    return Server;
}());
exports.Server = Server;
