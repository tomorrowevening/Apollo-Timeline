'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CSSUtil = require('apollo-utils/CSSUtil');

var _CSSUtil2 = _interopRequireDefault(_CSSUtil);

var _SVGUtil = require('./SVGUtil');

var _SVGUtil2 = _interopRequireDefault(_SVGUtil);

var _Keyframe = require('../timeline/Keyframe');

var _Keyframe2 = _interopRequireDefault(_Keyframe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVGItem = function () {
    function SVGItem(json, timeline) {
        _classCallCheck(this, SVGItem);

        this.item = _SVGUtil2.default.create();
        _CSSUtil2.default.extend(this.item);

        this.item.title = json.name;
        var masks = _SVGUtil2.default.createMasks(this.item, json);
        var transform = json.transform;
        if (transform !== undefined) SVGItem.transform(this.item, transform, timeline);

        var width = 0;
        var height = 0;

        var total = json.content.length;
        for (var i = 0; i < total; ++i) {
            var layer = json.content[i];
            var n = void 0,
                nTotal = void 0;
            if (layer.type === "shape") {
                var style = styleOptions(this.item, layer.content, timeline);
                var border = _SVGUtil2.default.getMaxBorder(style);

                nTotal = layer.paths.length;
                for (n = 0; n < nTotal; ++n) {
                    var p = layer.paths[n];
                    var svg = undefined;

                    switch (p.type) {
                        case "rectangle":
                            svg = _SVGUtil2.default.rectangle(p, style, this.item, timeline);
                            break;
                        case "ellipse":
                            svg = _SVGUtil2.default.ellipse(p, style, this.item, timeline);
                            this.item.x -= border / 2;
                            this.item.y -= border / 2;
                            break;
                        case "polygon":
                            break;
                        case "polystar":
                            break;
                        case "shape":
                            svg = _SVGUtil2.default.shape(p, style, this.item, timeline);
                            this.item.x -= border / 2;
                            this.item.y -= border / 2;
                            break;
                    }

                    if (svg !== undefined) {
                        this.item.x -= border / 2;
                        this.item.y -= border / 2;
                        _SVGUtil2.default.applyMasks(svg, masks);
                        this.item.appendChild(svg);
                    } else {
                        console.log(n, "no shape");
                    }
                }

                nTotal = layer.content.length;
                for (n = 0; n < nTotal; ++n) {
                    var _p = layer.content[n];
                    if (_p.type === 'trim') {
                        applyTrimPath(this.item.children[0], _p, timeline);
                    }
                }
            } else if (layer.type === "trim") {
                nTotal = this.item.children.length;
                for (n = 0; n < nTotal; ++n) {
                    var kid = this.item.children[n];
                    if (kid.tagName === "path") {
                        applyTrimPath(kid, layer, timeline);
                    }
                }
            }
        }
    }

    _createClass(SVGItem, null, [{
        key: 'transform',
        value: function transform(element, _transform, timeline) {
            var a = _transform.anchor;
            var p = _transform.position;
            var r = _transform.rotation;
            var s = _transform.scale;
            var originX = a[0] / element.width * 100;
            var originY = a[1] / element.height * 100;

            element.style.position = "absolute";

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
            element.opacity = _transform.opacity;

            if (_transform.timeline === undefined) return;

            var i = void 0,
                n = void 0,
                nTotal = void 0,
                total = _transform.timeline.length;
            for (i = 0; i < total; ++i) {
                var ani = _transform.timeline[i];
                nTotal = ani.keys.length;

                for (n = 0; n < nTotal; ++n) {
                    var key = ani.keys[n];
                    var from = key.value;
                    var target = key.target;
                    var delay = key.start;
                    var duration = key.duration;
                    var x0 = key.x0;
                    var y0 = key.y0;
                    var x1 = key.x1;
                    var y1 = key.y1;
                    var ease = [x0, y0, x1, y1];
                    var keyframe = undefined;

                    switch (ani.name) {
                        case "opacity":
                            keyframe = new _Keyframe2.default(element, 'opacity', target, duration, delay, ease, from);
                            break;

                        case "positionX":
                            keyframe = new _Keyframe2.default(element, 'x', target, duration, delay, ease, from);
                            break;
                        case "positionY":
                            keyframe = new _Keyframe2.default(element, 'y', target, duration, delay, ease, from);
                            break;
                        case "positionZ":
                            keyframe = new _Keyframe2.default(element, 'translateZ', target, duration, delay, ease, from);
                            break;

                        case "rotationX":
                            from *= -1;
                            keyframe = new _Keyframe2.default(element, 'rotateX', -target, duration, delay, ease, from);
                            break;
                        case "rotationY":
                            from *= -1;
                            keyframe = new _Keyframe2.default(element, 'rotateY', -target, duration, delay, ease, from);
                            break;
                        case "rotationZ":
                            keyframe = new _Keyframe2.default(element, 'rotateZ', target, duration, delay, ease, from);
                            break;

                        case "scaleX":
                            keyframe = new _Keyframe2.default(element, 'scaleX', target, duration, delay, ease, from);
                            break;
                        case "scaleY":
                            keyframe = new _Keyframe2.default(element, 'scaleY', target, duration, delay, ease, from);
                            break;
                        case "scaleZ":
                            keyframe = new _Keyframe2.default(element, 'scaleZ', target, duration, delay, ease, from);
                            break;
                    }

                    if (keyframe !== undefined) {
                        keyframe.easeType = key.type;
                        timeline.addKeyframe(keyframe);
                    }
                }
            }
        }
    }]);

    return SVGItem;
}();

exports.default = SVGItem;


function styleOptions(element, content, timeline) {
    var obj = {
        'fill': "none",
        'fillAlpha': 1,
        'stroke': undefined,
        'strokeAlpha': 1,
        'strokeCap': "butt",
        'strokeCorner': "miter",
        'strokeDashes': undefined,
        'strokeWidth': undefined,
        'transform': undefined,
        'timeline': []
    };

    var i = void 0,
        total = content.length;
    for (i = 0; i < total; ++i) {
        var n = content[i];

        if (n.type === "fill") {
            var r = Math.round(n.value.color[0] * 255).toString();
            var g = Math.round(n.value.color[1] * 255).toString();
            var b = Math.round(n.value.color[2] * 255).toString();
            var a = n.value.opacity;
            obj.fill = "rgb(" + r + ', ' + g + ', ' + b + ")";
            obj.fillAlpha = a;
            if (n.timeline.length > 0) {
                obj.timeline = obj.timeline.concat(n.timeline);
            }
        } else if (n.type === "stroke") {
            var _r = Math.round(n.value.color[0] * 255).toString();
            var _g = Math.round(n.value.color[1] * 255).toString();
            var _b = Math.round(n.value.color[2] * 255).toString();
            obj.stroke = "rgb(" + _r + ', ' + _g + ', ' + _b + ")";
            obj.strokeAlpha = n.value.opacity;
            obj.strokeCap = n.value.cap;
            obj.strokeCorner = n.value.corner;
            obj.strokeDashes = n.value.dashes;
            obj.strokeWidth = n.value.width;
            if (n.timeline.length > 0) {
                obj.timeline = obj.timeline.concat(n.timeline);
            }
        } else if (n.type === "transform") {
            obj.transform = n;
        } else if (n.type === "trim") {
            var kTotal = element.children.length;
            for (var k = 0; k < kTotal; ++k) {
                var kid = element.children[k];
                if (kid.tagName === "path") {
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
        "start": "startPercent",
        "end": "endPercent",
        "offset": "offsetPercent"
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

                var from = key.value;
                var target = key.target;
                var delay = key.start;
                var duration = key.duration;
                var x0 = key.x0;
                var y0 = key.y0;
                var x1 = key.x1;
                var y1 = key.y1;
                var ease = [x0, y0, x1, y1];

                var keyframe = new _Keyframe2.default(element, param, target, duration, delay, ease, from);
                keyframe.easeType = key.type;
                timeline.addKeyframe(keyframe);
            }
        }
    }
}