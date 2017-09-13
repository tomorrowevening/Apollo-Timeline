'use strict';

var _MathUtil = require('apollo-utils/MathUtil');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function organizeList(list) {
  var order = ['stroke', 'fill', 'transform', 'trim', 'repeater'];
  var i = void 0,
      n = void 0,
      total = order.length,
      nTotal = list.length;
  var listOrder = [];
  for (i = 0; i < total; ++i) {
    var orderName = order[i];
    for (n = 0; n < nTotal; ++n) {
      var listName = list[n].type;
      if (orderName === listName) {
        listOrder.push(list[n]);
        break;
      }
    }
  }
  return listOrder;
}

module.exports = function (THREE) {
  var THREELayer = require('./THREELayer')(THREE);
  var THREELineGeometry = require('./THREELineGeometry')(THREE);
  var StrokeMaterial = require('./materials/StrokeMaterial')(THREE);

  var THREEShape = function (_THREELayer) {
    _inherits(THREEShape, _THREELayer);

    function THREEShape(json, timeline) {
      _classCallCheck(this, THREEShape);

      var _this = _possibleConstructorReturn(this, (THREEShape.__proto__ || Object.getPrototypeOf(THREEShape)).call(this, json, timeline));

      _this.mesh = new THREE.Object3D();
      _this.item.add(_this.mesh);

      var s = window.devicePixelRatio;
      var parent = _this.mesh;

      function createShape(content) {
        var i = void 0,
            totalC = content.length,
            material = void 0,
            n = void 0,
            nTotal = void 0,
            data = void 0;
        for (i = 0; i < totalC; ++i) {
          var cLayer = content[i];
          var isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
          if (isShape) {
            var geometry = void 0,
                mesh = void 0,
                shape = void 0,
                fill = void 0,
                stroke = void 0,
                color = void 0,
                container = void 0,
                folder = void 0,
                trim = void 0,
                repeater = void 0,
                closed = true,
                transform = {
              opacity: 1,
              anchor: [0, 0, 0],
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              timeline: []
            };
            nTotal = cLayer.content.length;
            data = organizeList(cLayer.content);
            for (n = 0; n < nTotal; ++n) {
              var nLayer = data[n];
              switch (nLayer.type) {
                case 'fill':
                  fill = {
                    alpha: nLayer.value.opacity,
                    color: nLayer.value.color,
                    timeline: nLayer.timeline[0]
                  };
                  break;

                case 'stroke':
                  stroke = {
                    alpha: nLayer.value.opacity,
                    color: nLayer.value.color,
                    width: nLayer.value.width * s,
                    dashes: nLayer.value.dashes,
                    timeline: nLayer.timeline[0]
                  };
                  break;

                case 'transform':
                  transform = nLayer;
                  break;

                case 'trim':
                  trim = nLayer;
                  break;

                case 'repeater':
                  repeater = nLayer;
                  break;
              }
            }

            shape = new THREE.Shape();

            nTotal = cLayer.paths.length;

            for (n = 0; n < nTotal; ++n) {
              var angle = void 0,
                  pt = void 0,
                  pts = void 0,
                  x = void 0,
                  y = void 0,
                  w = void 0,
                  h = void 0,
                  t = void 0,
                  u = void 0,
                  poly = void 0,
                  totalPoints = void 0,
                  curved = void 0,
                  path = cLayer.paths[n];
              closed = true;
              switch (path.type) {
                case 'ellipse':
                  x = path.x * s;
                  y = path.y * s;
                  w = path.width / 2 * s;
                  h = path.height / 2 * s;
                  shape.ellipse(x, y, w, h, 0, _MathUtil.TWO_PI, true, Math.PI / 2);
                  break;

                case 'rectangle':
                  x = (path.x - path.width / 2) * s;
                  y = (path.y - path.height / 2) * s;
                  w = path.width * s;
                  h = path.height * s;
                  shape.moveTo(x + w, y + h);
                  shape.lineTo(x + w, y);
                  shape.lineTo(x, y);
                  shape.lineTo(x, y + h);
                  break;

                case 'polygon':
                  totalPoints = path.points;
                  w = path.radius * s;
                  angle = _MathUtil.HALF_PI;
                  shape.moveTo(Math.cos(angle) * w, Math.sin(angle) * w);
                  for (t = 1; t < path.points + 1; ++t) {
                    angle = t / totalPoints * _MathUtil.TWO_PI + _MathUtil.HALF_PI;
                    shape.lineTo(Math.cos(angle) * w, Math.sin(angle) * w);
                  }
                  break;

                case 'polystar':
                  totalPoints = path.points * 2;
                  w = path.outRadius * s;
                  h = path.inRadius * s;
                  angle = (0, _MathUtil.toRad)(path.rotation) + _MathUtil.HALF_PI;
                  shape.moveTo(Math.cos(angle) * w, Math.sin(angle) * w);

                  angle = 1 / totalPoints * _MathUtil.TWO_PI + (0, _MathUtil.toRad)(path.rotation) + _MathUtil.HALF_PI;
                  shape.lineTo(Math.cos(angle) * h, Math.sin(angle) * h);

                  for (t = 1; t < path.points; ++t) {
                    angle = t * 2 / totalPoints * _MathUtil.TWO_PI + (0, _MathUtil.toRad)(path.rotation) + _MathUtil.HALF_PI;
                    shape.lineTo(Math.cos(angle) * w, Math.sin(angle) * w);

                    angle = (t * 2 + 1) / totalPoints * _MathUtil.TWO_PI + (0, _MathUtil.toRad)(path.rotation) + _MathUtil.HALF_PI;
                    shape.lineTo(Math.cos(angle) * h, Math.sin(angle) * h);
                  }
                  break;

                case 'shape':
                  totalPoints = path.vertices.length;
                  curved = false;
                  closed = path.closed;
                  shape.moveTo(path.vertices[0][0] * s, path.vertices[0][1] * -s);
                  for (u = 0; u < totalPoints; ++u) {
                    if (path.inTangents[u][0] !== 0 || path.inTangents[u][1] !== 0 || path.outTangents[u][0] !== 0 || path.outTangents[u][1] !== 0) {
                      curved = true;
                      break;
                    }
                  }

                  if (curved) {
                    for (u = 0; u < totalPoints; ++u) {
                      t = u + 1;
                      if (path.closed) t = t % totalPoints;else if (t >= totalPoints) break;
                      shape.bezierCurveTo((path.vertices[u][0] + path.outTangents[u][0]) * s, (path.vertices[u][1] + path.outTangents[u][1]) * -s, (path.vertices[t][0] + path.inTangents[t][0]) * s, (path.vertices[t][1] + path.inTangents[t][1]) * -s, path.vertices[t][0] * s, path.vertices[t][1] * -s);
                    }
                  } else {
                    for (u = 0; u < totalPoints; ++u) {
                      t = u + 1;
                      if (path.closed) t = t % totalPoints;else if (t >= totalPoints) break;
                      shape.lineTo(path.vertices[t][0] * s, path.vertices[t][1] * -s);
                    }
                  }
                  THREELayer.morph(shape, path, timeline, path.closed);
                  break;
              }
            }

            container = new THREE.Object3D();
            parent.add(container);

            if (fill !== undefined) {
              color = new THREE.Color(fill.color[0], fill.color[1], fill.color[2]);
              material = new THREE.MeshBasicMaterial({
                color: color,
                opacity: fill.alpha,
                side: THREE.DoubleSide,
                transparent: true,
                depthTest: false
              });
              geometry = new THREE.ShapeGeometry(shape);
              mesh = new THREE.Mesh(geometry, material);
              THREELayer.transform(container, mesh, transform, timeline);
              container.add(mesh);

              if (fill.timeline !== undefined) {
                (function () {
                  var ani = {
                    color: [color.r, color.g, color.b, 1],
                    onUpdate: function onUpdate() {
                      material.color.r = ani.color[0];
                      material.color.g = ani.color[1];
                      material.color.b = ani.color[2];
                    }
                  };
                  THREELayer.animate(ani, 'color', timeline, fill.timeline, 1, {
                    onUpdate: ani.onUpdate
                  });
                })();
              }
            }

            if (stroke !== undefined) {
              color = new THREE.Color(stroke.color[0], stroke.color[1], stroke.color[2]);
              material = new StrokeMaterial({
                diffuse: color.getHex(),
                opacity: stroke.alpha,
                thickness: stroke.width
              });

              if (stroke.timeline !== undefined) {
                (function () {
                  var ani = {
                    color: [color.r, color.g, color.b, 1],
                    onUpdate: function onUpdate() {
                      material.uniforms.diffuse.value.r = ani.color[0];
                      material.uniforms.diffuse.value.g = ani.color[1];
                      material.uniforms.diffuse.value.b = ani.color[2];
                    }
                  };
                  THREELayer.animate(ani, 'color', timeline, stroke.timeline, 1, {
                    onUpdate: ani.onUpdate
                  });
                })();
              }

              if (stroke.dashes !== undefined) {
                material.uniforms.dash.value.x = stroke.dashes.dash * s;
                material.uniforms.dash.value.y = stroke.dashes.gap * s;
                material.uniforms.dash.value.z = stroke.dashes.offset * s;

                if (stroke.dashes.timeline !== undefined) {
                  nTotal = stroke.dashes.timeline.length;
                  for (n = 0; n < nTotal; ++n) {
                    switch (stroke.dashes.timeline[n].name) {
                      case 'dash':
                        THREELayer.animate(material.uniforms.dash.value, 'x', timeline, stroke.dashes.timeline[n], s);
                        break;
                      case 'gap':
                        THREELayer.animate(material.uniforms.dash.value, 'y', timeline, stroke.dashes.timeline[n], s);
                        break;
                      case 'offset':
                        THREELayer.animate(material.uniforms.dash.value, 'z', timeline, stroke.dashes.timeline[n], s);
                        break;
                    }
                  }
                }
              }

              if (trim !== undefined) {
                material.uniforms.trim.value.x = trim.value.start;
                material.uniforms.trim.value.y = trim.value.end;
                material.uniforms.trim.value.z = trim.value.offset;

                nTotal = trim.timeline.length;
                for (n = 0; n < nTotal; ++n) {
                  switch (trim.timeline[n].name) {
                    case 'start':
                      THREELayer.animate(material.uniforms.trim.value, 'x', timeline, trim.timeline[n]);
                      break;
                    case 'end':
                      THREELayer.animate(material.uniforms.trim.value, 'y', timeline, trim.timeline[n]);
                      break;
                    case 'offset':
                      THREELayer.animate(material.uniforms.trim.value, 'z', timeline, trim.timeline[n]);
                      break;
                  }
                }
              }

              var geom = shape.createPointsGeometry(36);
              var _pts = THREELineGeometry.createPath(geom, false);
              var dst = stroke.dashes !== undefined || trim !== undefined;
              geometry = new THREELineGeometry(_pts, {
                closed: closed,
                distances: dst
              });

              mesh = new THREE.Mesh(geometry, material);
              THREELayer.transform(container, mesh, transform, timeline);
              container.add(mesh);
            }
          } else {
            var group = new THREE.Object3D();
            group.name = cLayer.name;
            parent.add(group);
            parent = group;
            createShape(cLayer.content);
          }
        }
      }
      createShape(json.content);
      THREELayer.transform(_this.item, _this.mesh, json.transform, timeline);
      return _this;
    }

    return THREEShape;
  }(THREELayer);

  return THREEShape;
};