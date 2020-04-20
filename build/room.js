"use strict";
exports.__esModule = true;
var Helper = require("./helpers");
var Room = /** @class */ (function () {
    //private clients: Client[] = [];
    function Room() {
        this.id = Helper.roomId();
    }
    Room.prototype.serialize = function () {
        return {
            "id": this.id,
            "password": this.password,
            "background": this.background,
            "host": this.host
        };
    };
    return Room;
}());
exports.Room = Room;
