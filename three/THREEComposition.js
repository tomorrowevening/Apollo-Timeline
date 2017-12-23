'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Loader = require('apollo-utils/Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _MathUtil = require('apollo-utils/MathUtil');

var _Keyframe = require('../Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

var _Composition2 = require('../Composition');

var _Composition3 = _interopRequireDefault(_Composition2);

var _TimelineConfig = require('../TimelineConfig');

var _TimelineConfig2 = _interopRequireDefault(_TimelineConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
  var THREELayer = require('./THREELayer')(THREE);
  var THREEImage = require('./THREEImage')(THREE);
  var THREEShape = require('./THREEShape')(THREE);
  var THREETextLayer = require('./THREEText')(THREE).THREETextLayer;
  var THREEVideo = require('./THREEVideo')(THREE);
  var setupPostEffects = require('./THREEPost')(THREE);

  require('./EffectComposer')(THREE);
  var BlurPass = require('./passes/BlurPass')(THREE);
  var TrackMattePass = require('./passes/TrackMattePass')(THREE);

  var THREEComposition = function (_Composition) {
    _inherits(THREEComposition, _Composition);

    function THREEComposition(json, renderer) {
      _classCallCheck(this, THREEComposition);

      var _this = _possibleConstructorReturn(this, (THREEComposition.__proto__ || Object.getPrototypeOf(THREEComposition)).call(this, json));

      _this.renderer = renderer;
      _this.item = new THREE.Scene();
      _this.setupPerspectiveCam();
      _this.post = setupPostEffects(_this.item, _this.camera, renderer);
      if (json.isTrackMatte) {
        _this.post.copy.renderToScreen = false;
      }
      return _this;
    }

    _createClass(THREEComposition, [{
      key: 'setupPerspectiveCam',
      value: function setupPerspectiveCam() {
        var fov = 60;
        var wid = this.renderer.domElement.width;
        var hei = this.renderer.domElement.height;
        this.camera = new THREE.PerspectiveCamera(fov, wid / hei, 1, 3500);
        this.camera.position.set(0, 0, 1000);
      }
    }, {
      key: 'setupOrthoCam',
      value: function setupOrthoCam() {
        var wid = this.renderer.domElement.width;
        var hei = this.renderer.domElement.height;
        this.camera = new THREE.OrthographicCamera(wid / -2, wid / 2, hei / 2, hei / -2, 1, 3500);
        this.camera.position.set(0, 0, 1000);
      }
    }, {
      key: 'setupEffects',
      value: function setupEffects() {}
    }, {
      key: 'update',
      value: function update(time, duration) {
        var d = duration !== undefined ? duration : this.timeline.duration;
        this.timeline.update(time, d);

        var t = this.timeline.seconds;
        this.updateLayers(t, d);
        this.updateCamera();
      }
    }, {
      key: 'draw',
      value: function draw() {
        this.post.composer.render();

        var time = this.seconds;
        var total = this.layers.length;
        for (var i = 0; i < total; ++i) {
          var l = this.layers[i];
          var visible = l.showable(time);
          if (visible) l.draw();
        }
      }
    }, {
      key: 'updateCamera',
      value: function updateCamera() {
        var w = this.renderer.domElement.width;
        var h = this.renderer.domElement.height;
        var a = w / h;

        var isOrtho = this.camera instanceof THREE.OrthographicCamera;
        if (isOrtho) {
          this.camera.left = w / -2;
          this.camera.right = w / 2;
          this.camera.top = h / 2;
          this.camera.bottom = h / -2;
        } else {
          var dist = this.camera.position.z;
          var fov = 2 * Math.atan(w / a / (2 * dist)) * (180 / Math.PI);
          this.camera.fov = fov;
        }

        this.camera.position.x = w / 2;
        this.camera.position.y = h / -2;

        this.camera.aspect = a;
        this.camera.updateProjectionMatrix();
      }
    }, {
      key: 'updateLayers',
      value: function updateLayers(time, duration) {
        var total = this.layers.length;
        for (var i = 0; i < total; ++i) {
          var l = this.layers[i];
          var visible = l.showable(time);

          if (visible) {
            if (l instanceof _Composition3.default) {
              if (!l.showing && l.timeline.restartable) {
                l.play();
              }
              l.update();
            } else {
              l.update();
            }
          } else if (l.showing && l instanceof _Composition3.default) {
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
          l.item.visible = visible;
        }
      }
    }, {
      key: 'resize',
      value: function resize(w, h) {
        this.post.resize(w, h);
        _get(THREEComposition.prototype.__proto__ || Object.getPrototypeOf(THREEComposition.prototype), 'resize', this).call(this, w, h);
      }
    }, {
      key: 'applyEffects',
      value: function applyEffects(effects) {
        var _this2 = this;

        effects.forEach(function (effect) {
          var efft = void 0;
          if (effect.name === 'Gaussian Blur') {
            var multiplier = 0.067;
            efft = new BlurPass(_this2.camera);
            efft.uniforms.radius.value = effect.blurriness * multiplier;
            efft.uniforms.dir.value.set(effect.direction[0], effect.direction[1]);
            if (effect.timeline.blurriness !== undefined) {
              THREELayer.animate(efft.uniforms.radius, 'value', _this2.timeline, effect.timeline.blurriness, multiplier);
            }
          }

          if (efft !== undefined) {
            _this2.post.add(efft);
          }
        });
      }
    }, {
      key: 'buildLayer',
      value: function buildLayer(json, item) {
        var layer = _get(THREEComposition.prototype.__proto__ || Object.getPrototypeOf(THREEComposition.prototype), 'buildLayer', this).call(this, json, item);

        if (item.isTrackMatte) {
          var prevLayer = json.layers[this.layers.length];
          var type = prevLayer.trackMatte;
          var iType = 0;
          if (type === 'alpha') iType = 1;else if (type === 'alphaInverted') iType = 2;else if (type === 'luma') iType = 3;else if (type === 'lumaInverted') iType = 4;
          var pass = new THREE.MattePass({
            type: iType,
            anchor: item.transform.anchor,
            pos: item.transform.position,
            scale: item.transform.scale,
            rotation: item.transform.rotation[2]
          });

          if (item.type === 'image') {
            var imgID = _Loader2.default.fileID(item.name);
            var tex = _TimelineConfig2.default.textures[imgID];

            pass.mattes = [tex];
            pass.width = tex.image.width;
            pass.height = tex.image.height;
            this.item.remove(layer.item);
            layer = undefined;
          } else if (item.type === 'composition') {
            pass.mattes = [layer.post.composer.writeBuffer.texture, layer.post.composer.readBuffer.texture];
            pass.width = layer.post.composer.writeBuffer.width;
            pass.height = layer.post.composer.writeBuffer.height;

            if (prevLayer.type === 'composition') {
              var prev = this.layers[this.layers.length - 1];
              prev.post.add(pass);
              return layer;
            }
          }

          this.post.add(pass);
        }

        return layer;
      }
    }, {
      key: 'buildLayerComposition',
      value: function buildLayerComposition(json, item) {
        var cJSON = _TimelineConfig2.default.json.project.compositions[item.name];
        var atlas = _TimelineConfig2.default.json.atlas.compositions[item.name];
        var layer = new THREEComposition(item, this.renderer);
        layer.build(cJSON, this);
        layer.buildAtlas(atlas);
        layer.applyEffects(item.effects);
        layer.setupEffects();
        return layer;
      }
    }, {
      key: 'buildLayerImage',
      value: function buildLayerImage(json, item) {
        var layer = new THREEImage(item, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerShape',
      value: function buildLayerShape(json, item) {
        var layer = new THREEShape(item, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerText',
      value: function buildLayerText(json, item) {
        var layer = new THREETextLayer(item, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerVideo',
      value: function buildLayerVideo(json, item) {
        var layer = new THREEVideo(item, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }]);

    return THREEComposition;
  }(_Composition3.default);

  return THREEComposition;
};