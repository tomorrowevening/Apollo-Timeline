'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CSSUtil = require('apollo-utils/CSSUtil');

var _SVGUtil = require('apollo-utils/SVGUtil');

var _SVGUtil2 = require('./SVGUtil');

var _Keyframe = require('../Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVGItem = function () {
  function SVGItem(json, timeline) {
    _classCallCheck(this, SVGItem);

    this.item = (0, _SVGUtil.SVGCreate)();
    (0, _CSSUtil.CSSExtend)(this.item);

    this.item.title = json.name;
    var masks = (0, _SVGUtil.createMasks)(this.item, json);
    if (json.transform !== undefined) {
      transform(this.item, json.transform, timeline);
    }

    var width = 0;
    var height = 0;

    var total = json.content.length;
    for (var i = 0; i < total; ++i) {
      var layer = json.content[i];
      var n = void 0,
          nTotal = void 0;
      if (layer.type === 'shape') {
        var style = styleOptions(this.item, layer.content, timeline);
        var border = (0, _SVGUtil.getMaxBorder)(style);

        nTotal = layer.paths.length;
        for (n = 0; n < nTotal; ++n) {
          var p = layer.paths[n];
          var svg = undefined;
          switch (p.type) {
            case 'rectangle':
              svg = (0, _SVGUtil.SVGRectangle)(p, style, this.item, timeline);
              break;
            case 'ellipse':
              svg = (0, _SVGUtil.SVGEllipse)(p, style, this.item, timeline);
              this.item.x -= border / 2;
              this.item.y -= border / 2;
              break;
            case 'polygon':
              break;
            case 'polystar':
              break;
            case 'shape':
              svg = (0, _SVGUtil.SVGShape)(p, style, this.item, timeline);
              this.item.x -= border / 2;
              this.item.y -= border / 2;
              if (p.timeline !== undefined && p.timeline.length > 0) {
                (0, _SVGUtil2.SVGMorph)(svg, p.timeline, style, timeline);
              }
              break;
          }

          if (svg !== undefined) {
            this.item.x -= border / 2;
            this.item.y -= border / 2;
            (0, _SVGUtil.applyMasks)(svg, masks);

            if (style.timeline.length > 0 && timeline !== undefined) {
              (0, _SVGUtil2.SVGAnimate)(svg, style.timeline, timeline);
            }
            this.item.appendChild(svg);
          }
        }

        nTotal = layer.content.length;
        for (n = 0; n < nTotal; ++n) {
          var _p = layer.content[n];
          if (_p.type === 'trim') {
            applyTrimPath(this.item.children[0], _p, timeline);
          }
        }
      } else if (layer.type === 'trim') {
        nTotal = this.item.children.length;
        for (n = 0; n < nTotal; ++n) {
          var kid = this.item.children[n];
          if (kid.tagName === 'path') {
            applyTrimPath(kid, layer, timeline);
          }
        }
      }
    }
  }

  _createClass(SVGItem, null, [{
    key: 'transform',
    value: function (_transform) {
      function transform(_x, _x2, _x3) {
        return _transform.apply(this, arguments);
      }

      transform.toString = function () {
        return _transform.toString();
      };

      return transform;
    }(function (element, transform, timeline) {
      var a = transform.anchor;
      var p = transform.position;
      var r = transform.rotation;
      var s = transform.scale;
      var originX = a[0] / element.width * 100;
      var originY = a[1] / element.height * 100;

      element.style.position = 'absolute';

      element.x = p[0];
      element.y = p[1];
      element.rotateX = r[0];
      element.rotateY = r[1];
      element.rotateZ = r[2];
      element.scaleX = s[0];
      element.scaleY = s[1];
      element.originX = originX;
      element.originY = originY;
      element.translateX = -a[0];
      element.translateY = -a[1];
      element.translateZ = p.length > 2 ? p[2] : 0;
      element.opacity = transform.opacity;

      if (transform.timeline === undefined) return;

      var i = void 0,
          n = void 0,
          nTotal = void 0,
          total = transform.timeline.length;
      for (i = 0; i < total; ++i) {
        var ani = transform.timeline[i];
        nTotal = ani.keys.length;

        for (n = 0; n < nTotal; ++n) {
          var key = ani.keys[n];
          var target = key.target;
          var duration = key.duration;
          var x0 = key.x0;
          var y0 = key.y0;
          var x1 = key.x1;
          var y1 = key.y1;
          var keyframe = undefined;
          var params = {
            ease: [x0, y0, x1, y1],
            start: key.value,
            delay: key.start
          };

          switch (ani.name) {
            case 'opacity':
              keyframe = new _Keyframe2.default(element, 'opacity', target, duration, params);
              break;

            case 'positionX':
              keyframe = new _Keyframe2.default(element, 'x', target, duration, params);
              break;
            case 'positionY':
              keyframe = new _Keyframe2.default(element, 'y', target, duration, params);
              break;
            case 'positionZ':
              keyframe = new _Keyframe2.default(element, 'translateZ', target, duration, params);
              break;

            case 'rotationX':
              params.start *= -1;
              keyframe = new _Keyframe2.default(element, 'rotateX', -target, duration, params);
              break;
            case 'rotationY':
              params.start *= -1;
              keyframe = new _Keyframe2.default(element, 'rotateY', -target, duration, params);
              break;
            case 'rotationZ':
              keyframe = new _Keyframe2.default(element, 'rotateZ', target, duration, params);
              break;

            case 'scaleX':
              keyframe = new _Keyframe2.default(element, 'scaleX', target, duration, params);
              break;
            case 'scaleY':
              keyframe = new _Keyframe2.default(element, 'scaleY', target, duration, params);
              break;
            case 'scaleZ':
              keyframe = new _Keyframe2.default(element, 'scaleZ', target, duration, params);
              break;
          }

          if (keyframe !== undefined) {
            keyframe.easeType = key.type;
            timeline.addKeyframe(keyframe);
          }
        }
      }
    })
  }]);

  return SVGItem;
}();

exports.default = SVGItem;


function styleOptions(element, content, timeline) {
  var obj = {
    'fill': 'none',
    'fillAlpha': 1,
    'stroke': undefined,
    'strokeAlpha': 1,
    'strokeCap': 'butt',
    'strokeCorner': 'miter',
    'strokeDashes': undefined,
    'strokeWidth': undefined,
    'transform': undefined,
    'timeline': []
  };

  var i = void 0,
      total = content.length;
  for (i = 0; i < total; ++i) {
    var n = content[i];

    if (n.type === 'fill') {
      var r = Math.round(n.value.color[0] * 255).toString();
      var g = Math.round(n.value.color[1] * 255).toString();
      var b = Math.round(n.value.color[2] * 255).toString();
      var a = n.value.opacity;
      obj.fill = 'rgb(' + r + ', ' + g + ', ' + b + ')';
      obj.fillAlpha = a;
      if (n.timeline.length > 0) {
        obj.timeline = obj.timeline.concat(n.timeline);
      }
    } else if (n.type === 'stroke') {
      var _r = Math.round(n.value.color[0] * 255).toString();
      var _g = Math.round(n.value.color[1] * 255).toString();
      var _b = Math.round(n.value.color[2] * 255).toString();
      obj.stroke = 'rgb(' + _r + ', ' + _g + ', ' + _b + ')';
      obj.strokeAlpha = n.value.opacity;
      obj.strokeCap = n.value.cap;
      obj.strokeCorner = n.value.corner;
      obj.strokeDashes = n.value.dashes;
      obj.strokeWidth = n.value.width;
      if (n.timeline.length > 0) {
        obj.timeline = obj.timeline.concat(n.timeline);
      }
    } else if (n.type === 'transform') {
      obj.transform = n;
    } else if (n.type === 'trim') {
      var kTotal = element.children.length;
      for (var k = 0; k < kTotal; ++k) {
        var kid = element.children[k];
        if (kid.tagName === 'path') {
          applyTrimPath(kid, n, timeline);
        }
      }
    }
  }

  return obj;
}

function applyTrimPath(element, json, timeline) {
  element._startPercent = json.value.start;
  element._endPercent = json.value.end;
  element._offsetPercent = json.value.offset;
  element.updatePath();

  var map = {
    'start': 'startPercent',
    'end': 'endPercent',
    'offset': 'offsetPercent'
  };

  var i = void 0,
      total = json.timeline.length - 1;
  for (i = total; i > -1; --i) {
    var type = json.timeline[i];
    var param = map[type.name];
    if (param !== undefined) {
      var n = void 0,
          nTotal = type.keys.length;
      for (n = 0; n < nTotal; ++n) {
        var key = type.keys[n];
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

        var keyframe = new _Keyframe2.default(element, param, target, duration, params);
        keyframe.easeType = key.type;
        timeline.addKeyframe(keyframe);
      }
    }
  }
}