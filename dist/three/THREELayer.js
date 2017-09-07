'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MathUtil = require('apollo-utils/MathUtil');

var _Keyframe = require('../Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

var _ArrayKeyframe = require('../ArrayKeyframe');

var _ArrayKeyframe2 = _interopRequireDefault(_ArrayKeyframe);

var _Layer2 = require('../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
  var THREELayer = function (_Layer) {
    _inherits(THREELayer, _Layer);

    function THREELayer(json, timeline) {
      _classCallCheck(this, THREELayer);

      var _this = _possibleConstructorReturn(this, (THREELayer.__proto__ || Object.getPrototypeOf(THREELayer)).call(this, json));

      _this.item = new THREE.Object3D();
      _this.item.name = 'item';
      _this.mesh = undefined;return _this;
    }

    _createClass(THREELayer, null, [{
      key: 'animate',
      value: function animate(object, key, timeline, animation, deviceRatio, opt) {
        if (opt === undefined) opt = {};
        var scale = deviceRatio !== undefined ? deviceRatio : 1;
        var i = void 0,
            keyframe = void 0,
            total = animation.keys.length;
        for (i = 0; i < total; ++i) {
          var frame = animation.keys[i];
          var from = frame.value;
          var isArr = Array.isArray(from);
          var isStr = typeof from === 'string';
          var noScale = isArr || isStr;
          var target = noScale ? frame.target : frame.target * scale;
          var delay = frame.start;
          var duration = frame.duration;
          var params = {
            ease: [frame.x0, frame.y0, frame.x1, frame.y1],
            start: noScale ? from : from * scale,
            delay: delay,
            onUpdate: opt.onUpdate,
            onComplete: opt.onComplete
          };

          if (isArr) {
            keyframe = new _ArrayKeyframe2.default(object, key, target, duration, params);
          } else {
            keyframe = new _Keyframe2.default(object, key, target, duration, params);
          }
          keyframe.easeType = frame.type;
          timeline.addKeyframe(keyframe);
        }
      }
    }, {
      key: 'transform',
      value: function transform(container, mesh, _transform, timeline) {
        var scale = window.devicePixelRatio;
        var t = _transform;
        var a = t.anchor.length > 2 ? t.anchor : [t.anchor[0], t.anchor[1], 0];
        var p = t.position.length > 2 ? t.position : [t.position[0], t.position[1], 0];
        var r = t.rotation.length > 2 ? t.rotation : [t.rotation[0], t.rotation[1], 0];
        var s = t.scale.length > 2 ? t.scale : [t.scale[0], t.scale[1], 1];

        container.position.set(p[0] * scale, -p[1] * scale, p[2] * scale);
        container.scale.set(s[0], s[1], s[2]);
        container.rotation.set((0, _MathUtil.toRad)(r[0]), (0, _MathUtil.toRad)(r[1]), -(0, _MathUtil.toRad)(r[2]));
        if (mesh !== undefined) {
          mesh.position.set(-a[0] * scale, a[1] * scale, a[2] * scale);
          if (mesh.material !== undefined) mesh.material.opacity = t.opacity;
        }

        if (t.timeline === undefined) return;

        var i = void 0,
            n = void 0,
            total = void 0,
            nTotal = void 0;
        total = t.timeline.length;
        for (i = 0; i < total; ++i) {
          var ani = t.timeline[i];
          nTotal = ani.keys.length;

          for (n = 0; n < nTotal; ++n) {
            var key = ani.keys[n];
            var target = key.target;
            var duration = key.duration;
            var x0 = key.x0;
            var y0 = key.y0;
            var x1 = key.x1;
            var y1 = key.y1;
            var params = {
              ease: [x0, y0, x1, y1],
              start: key.value,
              delay: key.start
            };
            var keyframe = undefined;

            switch (ani.name) {
              case 'opacity':
                if (mesh !== undefined && mesh.material !== undefined) {
                  keyframe = new _Keyframe2.default(mesh.material, 'opacity', target, duration, params);
                }
                break;

              case 'anchorX':
                if (mesh !== undefined) {
                  params.start *= -scale;
                  keyframe = new _Keyframe2.default(mesh.position, 'x', -target * scale, duration, params);
                }
                break;
              case 'anchorY':
                if (mesh !== undefined) {
                  params.start *= scale;
                  keyframe = new _Keyframe2.default(mesh.position, 'y', target * scale, duration, params);
                }
                break;

              case 'positionX':
                params.start *= scale;
                keyframe = new _Keyframe2.default(container.position, 'x', target * scale, duration, params);
                break;
              case 'positionY':
                params.start *= -scale;
                keyframe = new _Keyframe2.default(container.position, 'y', -target * scale, duration, params);
                break;
              case 'positionZ':
                params.start *= scale;
                keyframe = new _Keyframe2.default(container.position, 'z', target * scale, duration, params);
                break;

              case 'rotationX':
                params.start = (0, _MathUtil.toRad)(params.start);
                keyframe = new _Keyframe2.default(container.rotation, 'x', (0, _MathUtil.toRad)(target), duration, params);
                break;
              case 'rotationY':
                params.start = -(0, _MathUtil.toRad)(params.start);
                keyframe = new _Keyframe2.default(container.rotation, 'y', -(0, _MathUtil.toRad)(target), duration, params);
                break;
              case 'rotationZ':
                params.start = -(0, _MathUtil.toRad)(params.start);
                keyframe = new _Keyframe2.default(container.rotation, 'z', -(0, _MathUtil.toRad)(target), duration, params);
                break;

              case 'scaleX':
                keyframe = new _Keyframe2.default(container.scale, 'x', target, duration, params);
                break;
              case 'scaleY':
                keyframe = new _Keyframe2.default(container.scale, 'y', target, duration, params);
                break;
              case 'scaleZ':
                keyframe = new _Keyframe2.default(container.scale, 'z', target, duration, params);
                break;
            }

            if (keyframe !== undefined) {
              keyframe.easeType = key.type;
              timeline.addKeyframe(keyframe);
            }
          }
        }
      }
    }, {
      key: 'morph',
      value: function morph(layer, path, timeline, closed) {}
    }]);

    return THREELayer;
  }(_Layer3.default);

  return THREELayer;
};