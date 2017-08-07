'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Timeline = require('./Timeline');

var _Timeline2 = _interopRequireDefault(_Timeline);

var _Timer = require('apollo-utils/Timer');

var _Marker = require('./Marker');

var _Marker2 = _interopRequireDefault(_Marker);

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
    _this.width = 0;
    _this.height = 0;
    _this.camera = undefined;

    _this.timeline = new _Timeline2.default();
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
    key: 'dispose',
    value: function dispose() {
      this.timeline.dispose();
      this.camera = undefined;
      this.layers = [];
    }
  }, {
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
              l.play();
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
    key: 'draw',
    value: function draw() {
      var time = this.seconds;
      var total = this.layers.length;
      for (var i = 0; i < total; ++i) {
        var l = this.layers[i];
        var visible = l.showable(time);
        if (visible) l.draw();
      }
    }
  }, {
    key: 'play',
    value: function play() {
      this.timeline.play();
      this.playLayers();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.timeline.pause();
      this.pauseLayers();
    }
  }, {
    key: 'playLayers',
    value: function playLayers() {
      var time = this.seconds;
      var i = void 0,
          l = void 0,
          total = this.layers.length;
      for (i = 0; i < total; ++i) {
        l = this.layers[i];
        if (i instanceof Composition && l.showable(time)) {
          l.play();
        }
      }
    }
  }, {
    key: 'pauseLayers',
    value: function pauseLayers() {
      var time = this.seconds;
      var i = void 0,
          l = void 0,
          total = this.layers.length;
      for (i = 0; i < total; ++i) {
        l = this.layers[i];
        if (i instanceof Composition && l.playing) {
          l.pause();
        }
      }
    }
  }, {
    key: 'build',
    value: function build(json, parentComp) {
      this.name = json.name;
      this.width = json.width;
      this.height = json.height;
      if (parentComp !== undefined) {
        this.duration = this.timeline.duration = Math.min(this.duration, parentComp.duration);
      }

      var i = void 0,
          total = void 0;

      total = json.markers.length;
      for (i = 0; i < total; ++i) {
        var m = json.markers[i];
        this.timeline.markers.push(new _Marker2.default(m.name, m.time, m.action));
      }

      total = json.layers.length;
      for (i = total - 1; i > -1; --i) {
        var layer = this.buildLayer(json.layers[i]);
        if (layer !== undefined) this.layers.push(layer);
      }
    }
  }, {
    key: 'buildAtlas',
    value: function buildAtlas(atlas) {
      if (atlas === undefined) return;

      if (atlas.settings !== undefined) {
        if (atlas.settings.duration !== undefined) {
          this.duration = this.timeline.duration = atlas.settings.duration;
        }

        if (atlas.settings.playMode !== undefined) {
          this.timeline.playMode = atlas.settings.playMode;
        }

        if (atlas.settings.playCount !== undefined) {
          this.timeline.maxPlays = atlas.settings.playCount;
        }
      }
    }
  }, {
    key: 'buildLayer',
    value: function buildLayer(json) {
      var layer = new _Layer3.default(json.name, json.start, json.duration);

      switch (json.type) {
        case 'audio':
          layer = this.buildLayerAudio(json);
          break;
        case 'composition':
          layer = this.buildLayerComposition(json);
          break;
        case 'image':
          layer = this.buildLayerImage(json);
          break;
        case 'shape':
          layer = this.buildLayerShape(json);
          break;
        case 'text':
          layer = this.buildLayerText(json);
          break;
        case 'video':
          layer = this.buildLayerVideo(json);
          break;
      }

      layer.duration = Math.min(this.timeline.duration, json.duration);

      return layer;
    }
  }, {
    key: 'buildLayerAudio',
    value: function buildLayerAudio(json) {
      var layer = new LayerAudio(json);
      return layer;
    }
  }, {
    key: 'buildLayerComposition',
    value: function buildLayerComposition(json) {
      var layer = new Composition(json);
      layer.build(json, this);
      return layer;
    }
  }, {
    key: 'buildLayerImage',
    value: function buildLayerImage(json) {
      var layer = new LayerImage(json);
      return layer;
    }
  }, {
    key: 'buildLayerShape',
    value: function buildLayerShape(json) {
      var layer = new LayerShape(json);
      return layer;
    }
  }, {
    key: 'buildLayerText',
    value: function buildLayerText(json) {
      var layer = new LayerText(json);
      return layer;
    }
  }, {
    key: 'buildLayerVideo',
    value: function buildLayerVideo(json) {
      var layer = new LayerVideo(json);
      return layer;
    }
  }, {
    key: 'seconds',
    get: function get() {
      return this.timeline.seconds;
    }
  }, {
    key: 'playing',
    get: function get() {
      return this.timeline.playing;
    }
  }]);

  return Composition;
}(_Layer3.default);

exports.default = Composition;