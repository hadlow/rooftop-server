"use strict";
exports.__esModule = true;
var Client = /** @class */ (function () {
    function Client(connection, room) {
        this.id = connection.id;
        this.room = room;
    }
    Client.prototype.serialize = function () {
        return {
            "id": this.id,
            "room": this.room,
            "host": this.host,
            "x": this.x,
            "y": this.y
        };
    };
    Client.prototype.deserialize = function (data) {
        this.id = data.id;
        this.room = data.room;
        this.host = data.host;
        this.x = data.x;
        this.y = data.y;
    };
    return Client;
}());
exports.Client = Client;
