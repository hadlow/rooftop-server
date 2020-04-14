"use strict";
exports.__esModule = true;
var Helper = require("./helpers");
var Room = /** @class */ (function () {
    function Room() {
        this.clients = [];
        this.id = Helper.roomId();
    }
    Room.prototype.getId = function () {
        return this.id;
    };
    Room.prototype.addClient = function (client) {
        this.clients.push(client);
    };
    Room.prototype.getClients = function () {
        return this.clients;
    };
    Room.prototype.serializeClients = function () {
        var clients = [];
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            var clientString = {
                "id": client.getId()
            };
            clients.push(clientString);
        }
        return clients;
    };
    return Room;
}());
exports.Room = Room;
