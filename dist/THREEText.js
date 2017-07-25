'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _threeText2d = require('three-text2d');

var _threeText2d2 = _interopRequireDefault(_threeText2d);

var _THREELayer2 = require('./THREELayer');

var _THREELayer3 = _interopRequireDefault(_THREELayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
    var THREEText = function (_THREELayer) {
        _inherits(THREEText, _THREELayer);

        function THREEText(json, timeline) {
            _classCallCheck(this, THREEText);

            var _this = _possibleConstructorReturn(this, (THREEText.__proto__ || Object.getPrototypeOf(THREEText)).call(this, json, timeline));

            _this.mesh = new THREE.Object3D();
            _this.item.add(_this.mesh);

            var fName = json.content.font;
            var fSize = json.content.fontSize * window.devicePixelRatio;
            var offY = Math.round(fSize * 0.33);
            var fColor = getHex(json.content.fillColor[0], json.content.fillColor[1], json.content.fillColor[2]);
            var tColor = new THREE.Color(fColor);
            _this.txtSprite = new _threeText2d2.default.SpriteText2D(json.content.text, {
                align: _threeText2d2.default.textAlign.bottomLeft,
                font: fSize.toString() + 'px ' + fName,
                fillStyle: tColor.getStyle(),
                antialias: true
            });
            _this.txtSprite.position.y = offY;
            _this.mesh.add(_this.txtSprite);

            _THREELayer3.default.transform(_this.item, _this.mesh, json.transform, timeline);
            return _this;
        }

        _createClass(THREEText, [{
            key: 'text',
            get: function get() {
                return this.txtSprite.text;
            },
            set: function set(value) {
                this.txtSprite.text = value;
            }
        }]);

        return THREEText;
    }(_THREELayer3.default);

    return THREEText;
};

function getHex(r, g, b) {
    return r * 255 << 16 ^ g * 255 << 8 ^ b * 255 << 0;
}