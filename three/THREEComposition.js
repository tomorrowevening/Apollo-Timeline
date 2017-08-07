'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MathUtil = require('apollo-utils/MathUtil');

var _Keyframe = require('../Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

var _Composition2 = require('../Composition');

var _Composition3 = _interopRequireDefault(_Composition2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
  var THREEImage = require('./THREEImage')(THREE);
  var THREEShape = require('./THREEShape')(THREE);
  var THREEText = require('./THREEText')(THREE);
  var THREEVideo = require('./THREEVideo')(THREE);
  require('./EffectComposer')(THREE);

  var THREEComposition = function (_Composition) {
    _inherits(THREEComposition, _Composition);

    function THREEComposition(json, renderer) {
      _classCallCheck(this, THREEComposition);

      var _this = _possibleConstructorReturn(this, (THREEComposition.__proto__ || Object.getPrototypeOf(THREEComposition)).call(this, json));

      _this.renderer = renderer;
      _this.item = new THREE.Scene();
      _this.setupPerspectiveCam();
      _this.setupPost();
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
      key: 'setupPost',
      value: function setupPost() {
        this.post = {
          effects: [],
          enabled: true,
          composer: undefined,
          resize: function resize(w, h) {
            var dpr = this.renderer.getPixelRatio();
            this.composer.setSize(w * dpr, h * dpr);
            this.effects.forEach(function (pass) {
              pass.setSize(w, h);
            });
          },
          getLastPass: function getLastPass() {
            return this.composer.passes[this.composer.passes.length - 1];
          }
        };

        var pixelRatio = this.renderer.getPixelRatio();
        var width = Math.floor(this.renderer.context.canvas.width / pixelRatio) || 1;
        var height = Math.floor(this.renderer.context.canvas.height / pixelRatio) || 1;
        var parameters = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: false
        };
        var renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
        this.post.composer = new THREE.EffectComposer(this.renderer, renderTarget);
        var renderPass = new THREE.RenderPass(this.item, this.camera);
        var copyPass = new THREE.ShaderPass(THREE.CopyShader);

        copyPass.renderToScreen = true;
        copyPass.material.transparent = true;

        this.post.composer.addPass(renderPass);

        var total = this.post.effects.length;
        for (var i = 0; i < total; ++i) {
          this.post.composer.addPass(this.post.effects[i]);
        }

        this.post.composer.setSize(width * pixelRatio, height * pixelRatio);
      }
    }, {
      key: 'update',
      value: function update(time) {
        this.timeline.update();
        this.updateLayers();
        this.updateCamera();
      }
    }, {
      key: 'draw',
      value: function draw() {
        if (this.post.enabled && this.post.effects.length > 0) {
          this.post.composer.render();
        } else {
          this.renderer.render(this.item, this.camera);
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
      key: 'buildLayerComposition',
      value: function buildLayerComposition(json) {
        var cJSON = Loader.json.project.compositions[json.name];
        var atlas = Loader.json.atlas.compositions[json.name];
        var layer = new THREEComposition(json, this.renderer);
        layer.build(cJSON, this);
        layer.buildAtlas(atlas);
        return layer;
      }
    }, {
      key: 'buildLayerImage',
      value: function buildLayerImage(json) {
        var layer = new THREEImage(json, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerShape',
      value: function buildLayerShape(json) {
        var layer = new THREEShape(json, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerText',
      value: function buildLayerText(json) {
        var layer = new THREEText(json, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }, {
      key: 'buildLayerVideo',
      value: function buildLayerVideo(json) {
        var layer = new THREEVideo(json, this.timeline);
        this.item.add(layer.item);
        return layer;
      }
    }]);

    return THREEComposition;
  }(_Composition3.default);

  return THREEComposition;
};