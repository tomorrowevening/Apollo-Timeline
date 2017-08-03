'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Marker = function Marker(name, time, params) {
  _classCallCheck(this, Marker);

  this.name = name;
  this.time = time;
  this.active = false;
  this.duration = 0;
  this.action = '';
  this.trigger = undefined;
  this.complete = undefined;
  if (params !== undefined) {
    if (params.duration !== undefined) this.duration = params.duration;
    if (params.action !== undefined) this.action = params.action;
    if (params.trigger !== undefined) this.trigger = params.trigger;
    if (params.complete !== undefined) this.complete = params.complete;
  }
};

exports.default = Marker;