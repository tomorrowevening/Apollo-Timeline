'use strict';

var _THREELayer2 = require('./THREELayer');

var _THREELayer3 = _interopRequireDefault(_THREELayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StrokeVertex = '\n    uniform float thickness;,\n    attribute float lineMiter;,\n    attribute vec2 lineNormal;,\n    attribute vec2 lineDistance;, // x = pos, y = total length\n    varying vec2 lineU;,\n\n    void main() {,\n        lineU = lineDistance;,\n        vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);,\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );,\n    }\n';

var StrokeFragment = '\n    varying vec2 lineU;,\n\n    uniform vec3 diffuse;,\n    uniform float opacity;,\n    uniform vec3 dash;, // x = dash,  y = gap, z = offset\n    uniform vec3 trim;, // x = start, y = end, z = offset\n\n    void main() {,\n        float opacityMod = 1.0;,\n        \n        // Dash\n        if(dash.x > 0.0 && dash.y > 0.0) {,\n            float dashEnd = dash.x + dash.y;,\n            float lineUMod = mod(lineU.x + dash.z, dashEnd);,\n            opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);,\n        },\n        \n        // Trim\n        if(trim.x > 0.0 || trim.y < 1.0) {,\n            float a = mod(trim.x + trim.z, 1.0);,\n            float b = mod(trim.y + trim.z, 1.0);,\n            float per = lineU.x / lineU.y;,\n            if(a < b) {,\n                if(per < a || per > b) {,\n                    opacityMod = 0.0;,\n                },\n            } else if(a > b) {,\n                if(per < a && per > b) {,\n                    opacityMod = 0.0;,\n                },\n            },\n        },\n        \n        if(opacityMod == 0.0) {,\n            discard;,\n        },\n        gl_FragColor = vec4(diffuse, opacity * opacityMod);,\n    }\n';

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

function createPath(geometry, scalar) {
    var s = scalar ? window.devicePixelRatio : 1;
    var path = [];
    var i = void 0,
        total = geometry.vertices.length;
    for (i = 0; i < total; ++i) {
        path.push([geometry.vertices[i].x * s, geometry.vertices[i].y * s]);
    }
    return path;
}

module.exports = function (THREE) {
    var Line = require('three-line-2d')(THREE);

    function THREEStrokeMaterial(opt) {
        return new THREE.ShaderMaterial({
            uniforms: {
                thickness: {
                    type: 'f',
                    value: opt.thickness !== undefined ? opt.thickness : 4.0
                },
                opacity: {
                    type: 'f',
                    value: opt.opacity !== undefined ? opt.opacity : 1.0
                },
                diffuse: {
                    type: 'c',
                    value: new THREE.Color(opt.diffuse !== undefined ? opt.diffuse : 0xffffff)
                },
                dash: {
                    type: 'f',
                    value: opt.dash !== undefined ? opt.dash : new THREE.Vector3(0, 10, 0)
                },
                trim: {
                    type: 'f',
                    value: opt.trim !== undefined ? opt.trim : new THREE.Vector3(0, 1, 0)
                }
            },
            vertexShader: StrokeVertex,
            fragmentShader: StrokeFragment,
            side: opt.side !== undefined ? opt.side : THREE.DoubleSide,
            transparent: opt.transparent !== undefined ? opt.transparent : true
        });
    }

    var THREEShape = function (_THREELayer) {
        _inherits(THREEShape, _THREELayer);

        function THREEShape(json, timeline, renderer, camera) {
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
                                case "fill":
                                    fill = {
                                        alpha: nLayer.value.opacity,
                                        color: nLayer.value.color
                                    };
                                    break;

                                case "stroke":
                                    stroke = {
                                        alpha: nLayer.value.opacity,
                                        color: nLayer.value.color,
                                        width: nLayer.value.width * s,
                                        dashes: nLayer.value.dashes
                                    };
                                    break;

                                case "transform":
                                    transform = nLayer;
                                    break;

                                case "trim":
                                    trim = nLayer;
                                    break;

                                case "repeater":
                                    repeater = nLayer;
                                    break;
                            }
                        }

                        if (stroke !== undefined) {
                            color = new THREE.Color(stroke.color[0], stroke.color[1], stroke.color[2]);
                            material = new THREEStrokeMaterial({
                                diffuse: color.getHex(),
                                opacity: stroke.alpha,
                                thickness: stroke.width
                            });

                            if (stroke.dashes !== undefined) {
                                material.uniforms.dash.value.x = stroke.dashes.dash * s;
                                material.uniforms.dash.value.y = stroke.dashes.gap * s;
                                material.uniforms.dash.value.z = stroke.dashes.offset * s;

                                if (stroke.dashes.timeline !== undefined) {
                                    nTotal = stroke.dashes.timeline.length;
                                    for (n = 0; n < nTotal; ++n) {
                                        switch (stroke.dashes.timeline[n].name) {
                                            case "dash":
                                                _THREELayer3.default.animate(material.uniforms.dash.value, 'x', timeline, stroke.dashes.timeline[n], true);
                                                break;
                                            case "gap":
                                                _THREELayer3.default.animate(material.uniforms.dash.value, 'y', timeline, stroke.dashes.timeline[n], true);
                                                break;
                                            case "offset":
                                                _THREELayer3.default.animate(material.uniforms.dash.value, 'z', timeline, stroke.dashes.timeline[n], true);
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
                                        case "start":
                                            _THREELayer3.default.animate(material.uniforms.trim.value, 'x', timeline, trim.timeline[n]);
                                            break;
                                        case "end":
                                            _THREELayer3.default.animate(material.uniforms.trim.value, 'y', timeline, trim.timeline[n]);
                                            break;
                                        case "offset":
                                            _THREELayer3.default.animate(material.uniforms.trim.value, 'z', timeline, trim.timeline[n]);
                                            break;
                                    }
                                }
                            }
                        } else if (fill !== undefined) {
                            color = new THREE.Color(fill.color[0], fill.color[1], fill.color[2]);
                            material = new THREE.MeshBasicMaterial({
                                color: color,
                                opacity: fill.alpha,
                                side: THREE.DoubleSide,
                                transparent: true,
                                depthTest: false
                            });
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
                                case "ellipse":
                                    x = path.x * s;
                                    y = path.y * s;
                                    w = path.width / 2 * s;
                                    h = path.height / 2 * s;
                                    shape.ellipse(x, y, w, h, 0, MathU.TWO_PI, true, Math.PI / 2);
                                    break;

                                case "rectangle":
                                    x = (path.x - path.width / 2) * s;
                                    y = (path.y - path.height / 2) * s;
                                    w = path.width * s;
                                    h = path.height * s;
                                    shape.moveTo(x, y);
                                    shape.lineTo(x + w, y);
                                    shape.lineTo(x + w, y + h);
                                    shape.lineTo(x, y + h);
                                    break;

                                case "polygon":
                                    totalPoints = path.points;
                                    w = path.radius * s;
                                    angle = MathU.HALF_PI;
                                    shape.moveTo(Math.cos(angle) * w, Math.sin(angle) * w);
                                    for (t = 1; t < path.points + 1; ++t) {
                                        angle = t / totalPoints * MathU.TWO_PI + MathU.HALF_PI;
                                        shape.lineTo(Math.cos(angle) * w, Math.sin(angle) * w);
                                    }
                                    break;

                                case "polystar":
                                    totalPoints = path.points * 2;
                                    w = path.outRadius * s;
                                    h = path.inRadius * s;
                                    angle = MathU.toRad(path.rotation) + MathU.HALF_PI;
                                    shape.moveTo(Math.cos(angle) * w, Math.sin(angle) * w);

                                    angle = 1 / totalPoints * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI;
                                    shape.lineTo(Math.cos(angle) * h, Math.sin(angle) * h);

                                    for (t = 1; t < path.points; ++t) {
                                        angle = t * 2 / totalPoints * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI;
                                        shape.lineTo(Math.cos(angle) * w, Math.sin(angle) * w);

                                        angle = (t * 2 + 1) / totalPoints * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI;
                                        shape.lineTo(Math.cos(angle) * h, Math.sin(angle) * h);
                                    }
                                    break;

                                case "shape":
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
                                    _THREELayer3.default.morph(shape, path, timeline, path.closed);
                                    break;
                            }
                        }

                        container = new THREE.Object3D();
                        parent.add(container);

                        if (stroke !== undefined) {
                            var geom = shape.createPointsGeometry(36);
                            var _pts = createPath(geom, false);
                            geometry = Line(_pts, {
                                closed: closed,
                                distances: stroke.dashes !== undefined || trim !== undefined
                            });
                        } else {
                            geometry = new THREE.ShapeGeometry(shape);
                        }

                        mesh = new THREE.Mesh(geometry, material);
                        _THREELayer3.default.transform(container, mesh, transform, timeline);

                        container.add(mesh);
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
            _THREELayer3.default.transform(_this.item, _this.mesh, json.transform, timeline);
            return _this;
        }

        return THREEShape;
    }(_THREELayer3.default);

    return THREEShape;
};