"use strict";
exports.__esModule = true;
var redis = require("redis");
var DB = /** @class */ (function () {
    function DB() {
        this.client = redis.createClient();
        this.client.on("error", function (error) {
            console.error(error);
        });
    }
    // Client
    DB.prototype.setClient = function (client, callback) {
        // Create client entry
        this.client.hmset("client." + client.id, client, callback);
    };
    DB.prototype.getClient = function (id, callback) {
        this.client.hgetall("client." + id, callback);
    };
    DB.prototype.getClients = function (clientIds, callback) {
        var _this = this;
        var clients = [];
        var remaining = clientIds.length;
        for (var _i = 0, clientIds_1 = clientIds; _i < clientIds_1.length; _i++) {
            var client = clientIds_1[_i];
            (function (client) {
                _this.client.hgetall('client.' + client, function (error, reply) {
                    clients.push(reply);
                    --remaining;
                    if (remaining === 0)
                        callback(clients);
                });
            })(client);
        }
    };
    DB.prototype.updateClientLocation = function (id, x, y, callback) {
        this.setClient({ "id": id, "x": x, "y": y }, callback);
    };
    DB.prototype.updateClientGroup = function (id, group, callback) {
        this.setClient({ "id": id, "group": group }, callback);
    };
    DB.prototype.removeClient = function (client) {
        // Remove client from room
        this.removeClientFromRoom(client.room, client.id);
        // Remove client from redis
        this.client.del("client." + client.id, function () {
        });
    };
    // Room
    DB.prototype.setRoom = function (room, callback) {
        // Create client entry
        this.client.hmset("room." + room.id, room, callback);
    };
    DB.prototype.addClientToRoom = function (room, client, callback) {
        this.client.rpush("room.clients." + room, client, callback);
    };
    DB.prototype.removeClientFromRoom = function (room, client) {
        this.client.lrem('room.clients.' + room, 0, client, function (error, data) {
            if (error)
                throw error;
        });
    };
    DB.prototype.roomExists = function (id, callback) {
        this.client.exists("room." + id, callback);
    };
    DB.prototype.getRoom = function (id, callback) {
        this.client.hgetall("room." + id, callback);
    };
    DB.prototype.getClientsForRoom = function (room, callback) {
        this.client.lrange("room.clients." + room, 0, -1, callback);
    };
    DB.prototype.removeRoom = function (room) {
        // Remove client from redis
        this.client.del("room." + room.id);
        this.client.del("room.clients." + room.id);
    };
    return DB;
}());
exports.DB = DB;
