'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Timeline = require('./Timeline');

var _Timer = require('apollo-utils/Timer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Composition = function (_Layer) {
  _inherits(Composition, _Layer);

  function Composition(obj) {
    _classCallCheck(this, Composition);

    var _this = _possibleConstructorReturn(this, (Composition.__proto__ || Object.getPrototypeOf(Composition)).call(this, obj));

    _this.layers = [];

    _this.timeline = new _Timeline.Timeline();
    if (obj.duration !== undefined) {
      _this.timeline.duration = obj.duration;
    }
    if (obj.maxPlays !== undefined) {
      _this.timeline.maxPlays = obj.maxPlays;
    }
    if (obj.mode !== undefined) {
      _this.timeline.mode = obj.mode;
    }

    _this.showing = _this.start === 0;
    return _this;
  }

  _createClass(Composition, [{
    key: 'addLayer',
    value: function addLayer(layer) {
      layer.showing = this.start === 0 && layer.start === 0;
      this.layers.push(layer);
    }
  }, {
    key: 'update',
    value: function update(time) {
      this.timeline.update();
      this.updateLayers();
    }
  }, {
    key: 'updateHandler',
    value: function updateHandler() {
      this.update(this.seconds);
      this.draw();
    }
  }, {
    key: 'updateLayers',
    value: function updateLayers() {
      var time = this.seconds;
      var total = this.layers.length;
      for (var i = 0; i < total; ++i) {
        var l = this.layers[i];
        var visible = l.showable(time);
        if (visible) {
          if (l instanceof Composition) {
            if (!l.showing && l.timeline.restartable) {
              l.timeline.time.stamp = _Timer.TIME.now();
            }
            l.update(time - l.start);
          } else {
            l.update(time - l.start);
          }
        } else if (l.showing) {
          if (l.timeline.playing && l.timeline.seconds > 0) {
            l.timeline.seconds = l.timeline.duration;

            if (l.timeline.time.speed < 0) {
              l.timeline.seconds = 0;
            }

            if (l.timeline.maxPlays > 0 && l.timeline.timesPlayed >= l.timeline.maxPlays || l.timeline.mode === 'once') {
              l.timeline.playing = false;
            }
          }
        }
        l.showing = visible;
      }
    }
  }, {
    key: 'seconds',
    get: function get() {
      return this.timeline.seconds;
    }
  }]);

  return Composition;
}(_Layer3.default);

exports.default = Composition;