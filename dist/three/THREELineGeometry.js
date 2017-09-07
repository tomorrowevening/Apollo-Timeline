'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var getNormals = require('polyline-normals');
var VERTS_PER_POINT = 2;

function distance2(x1, y1, x2, y2) {
  var xd = (x1 - x2) * (x1 - x2);
  var yd = (y1 - y2) * (y1 - y2);
  return Math.sqrt(xd + yd);
}

module.exports = function (THREE) {
  var THREELineGeometry = function (_THREE$BufferGeometry) {
    _inherits(THREELineGeometry, _THREE$BufferGeometry);

    function THREELineGeometry(path, opt) {
      _classCallCheck(this, THREELineGeometry);

      var _this = _possibleConstructorReturn(this, (THREELineGeometry.__proto__ || Object.getPrototypeOf(THREELineGeometry)).call(this));

      _this.pathLength = 0;

      if (Array.isArray(path)) {
        opt = opt || {};
      } else if ((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object') {
        opt = path;
        path = [];
      }

      opt = opt || {};

      _this.addAttribute('position', new THREE.BufferAttribute(undefined, 3));
      _this.addAttribute('lineNormal', new THREE.BufferAttribute(undefined, 2));
      _this.addAttribute('lineMiter', new THREE.BufferAttribute(undefined, 1));
      if (opt.distances) {
        _this.addAttribute('lineDistance', new THREE.BufferAttribute(undefined, 2));
      }
      if (typeof _this.setIndex === 'function') {
        _this.setIndex(new THREE.BufferAttribute(undefined, 1));
      } else {
        _this.addAttribute('index', new THREE.BufferAttribute(undefined, 1));
      }
      _this.update(path, opt.closed);
      return _this;
    }

    _createClass(THREELineGeometry, [{
      key: 'update',
      value: function update(path, closed) {
        path = path || [];
        var normals = getNormals(path, closed);

        if (closed) {
          path = path.slice();
          path.push(path[0]);
          normals.push(normals[0]);
        }

        var attrPosition = this.getAttribute('position');
        var attrNormal = this.getAttribute('lineNormal');
        var attrMiter = this.getAttribute('lineMiter');
        var attrDistance = this.getAttribute('lineDistance');
        var attrIndex = typeof this.getIndex === 'function' ? this.getIndex() : this.getAttribute('index');

        var indexCount = Math.max(0, (path.length - 1) * 6);
        if (!attrPosition.array || path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT) {
          var count = path.length * VERTS_PER_POINT;
          attrPosition.array = new Float32Array(count * 3);
          attrNormal.array = new Float32Array(count * 2);
          attrMiter.array = new Float32Array(count);
          attrIndex.array = new Uint16Array(indexCount);

          if (attrDistance) {
            attrDistance.array = new Float32Array(count * 2);
          }
        }

        if (undefined !== attrPosition.count) {
          attrPosition.count = count;
        }
        attrPosition.needsUpdate = true;

        if (undefined !== attrNormal.count) {
          attrNormal.count = count;
        }
        attrNormal.needsUpdate = true;

        if (undefined !== attrMiter.count) {
          attrMiter.count = count;
        }
        attrMiter.needsUpdate = true;

        if (undefined !== attrIndex.count) {
          attrIndex.count = indexCount;
        }
        attrIndex.needsUpdate = true;

        if (attrDistance) {
          if (undefined !== attrDistance.count) {
            attrDistance.count = count;
          }
          attrDistance.needsUpdate = true;
        }

        var index = 0;
        var c = 0;
        var dIndex = 0;
        var indexArray = attrIndex.array;
        var pathLength = 0,
            lastPt = undefined;

        path.forEach(function (point, pointIndex, list) {
          if (lastPt !== undefined) {
            pathLength += distance2(point[0], point[1], lastPt[0], lastPt[1]);
          }
          lastPt = point;
        });

        this.pathLength = pathLength;

        lastPt = undefined;
        var pos = 0,
            per = 0;
        path.forEach(function (point, pointIndex, list) {
          var i = index;
          indexArray[c++] = i + 0;
          indexArray[c++] = i + 1;
          indexArray[c++] = i + 2;
          indexArray[c++] = i + 2;
          indexArray[c++] = i + 1;
          indexArray[c++] = i + 3;

          var dist = 0;

          if (lastPt !== undefined) {
            dist = distance2(point[0], point[1], lastPt[0], lastPt[1]);
          }
          lastPt = point;

          attrPosition.setXYZ(index++, point[0], point[1], 0);
          attrPosition.setXYZ(index++, point[0], point[1], 0);

          if (attrDistance) {
            pos += dist;
            per += dist / pathLength;
            attrDistance.setXY(dIndex++, pos, pathLength);
            attrDistance.setXY(dIndex++, pos, pathLength);
          }
        });

        var nIndex = 0;
        var mIndex = 0;
        normals.forEach(function (n) {
          var norm = n[0];
          var miter = n[1];
          attrNormal.setXY(nIndex++, norm[0], norm[1]);
          attrNormal.setXY(nIndex++, norm[0], norm[1]);

          attrMiter.setX(mIndex++, -miter);
          attrMiter.setX(mIndex++, miter);
        });
      }
    }], [{
      key: 'createPath',
      value: function createPath(geometry, scalar) {
        var s = scalar ? window.devicePixelRatio : 1;
        var path = [];
        var i = void 0,
            total = geometry.vertices.length;
        for (i = 0; i < total; ++i) {
          path.push([geometry.vertices[i].x * s, geometry.vertices[i].y * s]);
        }
        return path;
      }
    }]);

    return THREELineGeometry;
  }(THREE.BufferGeometry);

  return THREELineGeometry;
};