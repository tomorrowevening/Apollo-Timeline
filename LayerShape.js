'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayerShape = exports.Shape = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Shape = exports.Shape = function () {
  function Shape() {
    _classCallCheck(this, Shape);

    this.fill = {
      color: 0xFFFFFF,
      enable: true
    };

    this.stroke = {
      color: 0xFFFFFF,
      enable: true,
      thickness: 1
    };

    this.vertices = [];
  }

  _createClass(Shape, [{
    key: 'update',
    value: function update() {}
  }, {
    key: 'draw',
    value: function draw() {}
  }]);

  return Shape;
}();

var LayerShape = exports.LayerShape = function (_Layer) {
  _inherits(LayerShape, _Layer);

  function LayerShape(obj) {
    _classCallCheck(this, LayerShape);

    var _this = _possibleConstructorReturn(this, (LayerShape.__proto__ || Object.getPrototypeOf(LayerShape)).call(this, obj));

    _this.item = new Shape();
    return _this;
  }

  return LayerShape;
}(_Layer3.default);