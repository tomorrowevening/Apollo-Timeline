"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Marker = function Marker(name, time, action, duration, trigger) {
    _classCallCheck(this, Marker);

    this.name = name !== undefined ? name : "";
    this.time = time !== undefined ? time : 0;
    this.action = action !== undefined ? action : "";
    this.duration = duration !== undefined ? duration : 0;
    this.trigger = trigger !== undefined ? trigger : function () {};
};

exports.default = Marker;