'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Keyframe2 = require('./Keyframe');

var _Keyframe3 = _interopRequireDefault(_Keyframe2);

var _MathUtil = require('apollo-utils/MathUtil');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArrayKeyframe = function (_Keyframe) {
  _inherits(ArrayKeyframe, _Keyframe);

  function ArrayKeyframe(object, key, endValue, duration, params) {
    _classCallCheck(this, ArrayKeyframe);

    return _possibleConstructorReturn(this, (ArrayKeyframe.__proto__ || Object.getPrototypeOf(ArrayKeyframe)).call(this, object, key, endValue, duration, params));
  }

  _createClass(ArrayKeyframe, [{
    key: 'update',
    value: function update(progress) {
      var percent = this.getPercent(progress);

      if (this.startValue === undefined) {
        this.startValue = this.object[this.key];
      }

      var i = void 0,
          total = this.startValue.length;
      for (i = 0; i < total; ++i) {
        this.object[this.key][i] = (0, _MathUtil.lerp)(percent, this.startValue[i], this.endValue[i]);
      }

      if (this.onUpdate !== undefined) {
        this.onUpdate(progress, percent);
      }
    }
  }]);

  return ArrayKeyframe;
}(_Keyframe3.default);

exports.default = ArrayKeyframe;