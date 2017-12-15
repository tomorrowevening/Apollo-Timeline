'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Keyframe = require('./Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

var _ArrayKeyframe = require('./ArrayKeyframe');

var _ArrayKeyframe2 = _interopRequireDefault(_ArrayKeyframe);

var _Dispatcher2 = require('apollo-utils/Dispatcher');

var _Dispatcher3 = _interopRequireDefault(_Dispatcher2);

var _Timer = require('apollo-utils/Timer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FPS_DELTA = 1 / 60 * 1000;

var Timeline = function (_Dispatcher) {
  _inherits(Timeline, _Dispatcher);

  function Timeline() {
    _classCallCheck(this, Timeline);

    var _this = _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).call(this));

    _this.additive = true;
    _this.duration = 0;
    _this.timesPlayed = 0;
    _this.maxPlays = 0;
    _this.mode = Timeline.LOOP;
    _this.keyframes = [];
    _this.markers = [];
    _this.delayed = [];
    _this.playing = true;
    _this.lastMarker = undefined;
    _this.time = {
      elapsed: 0,
      previous: 0,
      stamp: 0,
      speed: 1
    };
    return _this;
  }

  _createClass(Timeline, [{
    key: 'add',
    value: function add(target, key, to, duration, params) {
      params = params !== undefined ? params : {};
      var now = this.seconds;
      var newKey = new _Keyframe2.default(target, key, to, duration, {
        delay: params.delay !== undefined ? params.delay + now : now,
        ease: params.ease,
        start: params.start,
        onUpdate: params.onUpdate,
        onComplete: params.onComplete
      });
      return this.addKeyframe(newKey);
    }
  }, {
    key: 'addArray',
    value: function addArray(target, key, to, duration, params) {
      params = params !== undefined ? params : {};
      var now = this.seconds;
      var newKey = new _ArrayKeyframe2.default(target, key, to, duration, {
        delay: params.delay !== undefined ? params.delay + now : now,
        ease: params.ease,
        start: params.start,
        onUpdate: params.onUpdate,
        onComplete: params.onComplete
      });
      return this.addKeyframe(newKey);
    }
  }, {
    key: 'addKeyframe',
    value: function addKeyframe(keyframe) {
      this.keyframes.push(keyframe);
      return keyframe;
    }
  }, {
    key: 'addMarker',
    value: function addMarker(marker) {
      this.markers.push(marker);
      return this;
    }
  }, {
    key: 'delay',
    value: function delay(wait, callback, params) {
      var time = 0;
      this.delayed.push({
        time: wait * 1000 + _Timer.TIME.now(),
        callback: callback,
        params: params
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.keyframes = [];
      this.markers = [];
      this.delayed = [];
    }
  }, {
    key: 'play',
    value: function play() {
      if (this.time.elapsed === 0) {
        var total = this.keyframes.length - 1;
        for (var i = total; i > -1; --i) {
          this.keyframes[i].update(0);
          this.keyframes[i].active = false;
        }
      }
      this.time.stamp = _Timer.TIME.now();
      this.playing = true;
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.playing = false;
    }
  }, {
    key: 'update',
    value: function update(time, duration) {
      if (!this.playing) return;

      this.time.previous = this.seconds;

      if (time !== undefined) {
        this.time.elapsed = time * 1000;
      } else if (this.additive) {
        this.time.elapsed += FPS_DELTA * this.time.speed;
      } else {
        var now = _Timer.TIME.now();
        var delta = now - this.time.stamp;
        this.time.elapsed += delta * this.time.speed;
        this.time.stamp = now;
      }

      this.updateDelayed();

      var totalDuration = duration !== undefined ? duration : this.duration;
      if (totalDuration > 0) this.updatePlaymode(totalDuration);

      this.updateMarkers();

      this.updateKeyframes();
    }
  }, {
    key: 'updateDelayed',
    value: function updateDelayed() {
      var now = _Timer.TIME.now();
      var i = void 0,
          delay = void 0,
          total = this.delayed.length;
      for (i = 0; i < total; ++i) {
        delay = this.delayed[i];
        if (now >= delay.time) {
          delay.callback(delay.params);

          this.delayed.splice(i, 1);
          --i;
          --total;
        }
      }
    }
  }, {
    key: 'updateKeyframes',
    value: function updateKeyframes() {
      var i,
          now,
          key,
          percent,
          total = this.keyframes.length;
      var seconds = this.seconds;

      for (i = 0; i < total; ++i) {
        key = this.keyframes[i];
        now = seconds;
        percent = (now - key.timestamp) / key.duration;

        if (key.isActive(now)) {

          key.active = true;
          key.update(percent);
        } else if (key.active) {

          key.active = false;
          if (this.time.speed < 0) {
            key.restart();
          } else {
            key.complete();
          }
        } else {

          key.active = false;

          if (this.duration === 0 && now - key.timestamp > 1) {
            this.keyframes.splice(i, 1);
            --i;
            --total;
          }
        }
      }
    }
  }, {
    key: 'updateMarkers',
    value: function updateMarkers() {
      var before = this.time.previous;
      var now = this.seconds;
      if (before > now) return;

      var min = Math.min(before, now);
      var max = Math.max(before, now);
      var total = this.markers.length;
      for (var i = 0; i < total; ++i) {
        var marker = this.markers[i];
        var start = marker.time;
        var end = marker.duration + start;
        var active = start > min && start <= max;
        if (marker.duration > 0) {
          active = now > start && now <= end;
        }
        if (active) {
          if (!marker.active) this.trigger(i);
          marker.active = true;
        } else if (marker.active) {
          marker.active = false;
          if (marker.complete !== undefined) {
            marker.complete();
          }
        }
      }
    }
  }, {
    key: 'updatePlaymode',
    value: function updatePlaymode(duration) {
      var seconds = this.seconds;
      if (this.mode === Timeline.PING_PONG) {

        if (seconds >= duration) {
          this.time.elapsed = duration * 1000 - 1;
          this.time.speed *= -1;
        } else if (seconds < 0) {
          this.time.elapsed = 1;
          this.time.speed = Math.abs(this.time.speed);
          ++this.timesPlayed;

          if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
            this.pause();
          }
        }
      } else if (this.mode === Timeline.LOOP) {

        if (seconds > duration) {
          ++this.timesPlayed;
          if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
            this.pause();
            this.time.elapsed = 0;
          } else {
            this.time.elapsed = 0;
            var total = this.keyframes.length - 1;
            for (var i = total; i > -1; --i) {
              this.keyframes[i].update(0);
              this.keyframes[i].active = false;
            }
          }
        }
      } else {

        if (seconds > duration) {
          ++this.timesPlayed;
          this.pause();
          this.seconds = duration;
          this.notify(Timeline.COMPLETE);
        }
      }
    }
  }, {
    key: 'trigger',
    value: function trigger(index) {
      var marker = this.markers[index];
      if (marker === undefined) return false;

      if (marker.action === 'play') {
        this.seconds = marker.time;
        this.play();
      } else if (marker.action === 'stop') {
        this.pause();
        this.seconds = marker.time;
      } else if (marker.action === 'delay') {
        marker.trigger();
      }

      this.notify('marker', marker);

      return true;
    }
  }, {
    key: 'goToMarker',
    value: function goToMarker(name) {
      var marker = this.getMarker(name);
      if (marker !== undefined) {
        this.seconds = marker.time;
        this.play();
      }
      return marker;
    }
  }, {
    key: 'getMarker',
    value: function getMarker(name) {
      var i = void 0,
          total = this.markers.length;
      for (i = 0; i < total; ++i) {
        var marker = this.markers[i];
        if (marker.name === name) {
          return marker;
        }
      }
      return undefined;
    }
  }, {
    key: 'playMode',
    get: function get() {
      return this.mode;
    },
    set: function set(value) {
      this.mode = value;
      if (value === Timeline.LOOP || value === Timeline.ONCE) {
        this.time.speed = Math.abs(this.time.speed);
      }
    }
  }, {
    key: 'seconds',
    get: function get() {
      return this.time.elapsed / 1000;
    },
    set: function set(value) {
      this.time.elapsed = value * 1000;
    }
  }, {
    key: 'speed',
    get: function get() {
      return this.time.speed;
    },
    set: function set(value) {
      this.time.speed = value;
    }
  }, {
    key: 'restartable',
    get: function get() {
      if (!this.playing) return false;

      if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
        return false;
      }

      if (this.mode === Timeline.LOOP && this.timesPlayed > 0) {
        return false;
      }

      return true;
    }
  }]);

  return Timeline;
}(_Dispatcher3.default);

Timeline.LOOP = 'loop';
Timeline.ONCE = 'once';
Timeline.PING_PONG = 'pingPong';
Timeline.COMPLETE = 'complete';
exports.default = Timeline;