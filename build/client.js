"use strict";
exports.__esModule = true;
var Helper = require("./helpers");
var Client = /** @class */ (function () {
    function Client(connection) {
        this.id = Helper.guid();
        this.connection = connection;
    }
    Client.prototype.getId = function () {
        return this.id;
    };
    Client.prototype.getConnection = function () {
        return this.connection;
    };
    Client.prototype.setHost = function (host) {
        this.host = host;
    };
    Client.prototype.isHost = function () {
        return this.host;
    };
    return Client;
}());
exports.Client = Client;
