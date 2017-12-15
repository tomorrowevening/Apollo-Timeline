'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MathUtil = require('apollo-utils/MathUtil');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Keyframe = function () {
  function Keyframe(object, key, endValue, duration, params) {
    _classCallCheck(this, Keyframe);

    params = params !== undefined ? params : {};

    this.active = false;
    this.object = object;
    this.key = key;
    this.endValue = endValue;
    this.duration = duration;
    this.timestamp = params.delay !== undefined ? params.delay : 0;
    this.ease = params.ease !== undefined ? params.ease : [0.25, 0.25, 0.75, 0.75];
    this.startValue = params.start;
    this.onComplete = params.onComplete;
    this.onUpdate = params.onUpdate;
    this.easeType = Keyframe.BEZIER;

    if (this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3]) {
      this.easeType = Keyframe.LINEAR;
    }
  }

  _createClass(Keyframe, [{
    key: 'update',
    value: function update(progress) {
      var percent = this.getPercent(progress);

      if (this.startValue === undefined) {
        this.startValue = this.object[this.key];
      }

      this.object[this.key] = (0, _MathUtil.lerp)(percent, this.startValue, this.endValue);

      if (this.onUpdate !== undefined) {
        this.onUpdate(progress, percent);
      }
    }
  }, {
    key: 'restart',
    value: function restart() {
      this.update(0);
    }
  }, {
    key: 'complete',
    value: function complete() {
      this.update(1);

      if (this.onComplete !== undefined) this.onComplete();
      this.active = false;
    }
  }, {
    key: 'isActive',
    value: function isActive(time) {
      return time >= this.startTime && time < this.endTime;
    }
  }, {
    key: 'getPercent',
    value: function getPercent(progress) {
      var percent = progress;

      if (this.easeType === Keyframe.BEZIER) {
        percent = (0, _MathUtil.curveAt)(percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3]);
      } else if (this.easeType === Keyframe.HOLD) {
        percent = progress < 1 ? 0 : 1;
      }

      return percent;
    }
  }, {
    key: 'startTime',
    get: function get() {
      return this.timestamp;
    }
  }, {
    key: 'endTime',
    get: function get() {
      return this.timestamp + this.duration;
    }
  }]);

  return Keyframe;
}();

Keyframe.LINEAR = 'linear';
Keyframe.BEZIER = 'bezier';
Keyframe.HOLD = 'hold';
exports.default = Keyframe;