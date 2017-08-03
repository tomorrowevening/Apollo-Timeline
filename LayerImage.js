'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TimelineConfig = require('./TimelineConfig');

var _TimelineConfig2 = _interopRequireDefault(_TimelineConfig);

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LayerImage = function (_Layer) {
  _inherits(LayerImage, _Layer);

  function LayerImage(obj) {
    _classCallCheck(this, LayerImage);

    var _this = _possibleConstructorReturn(this, (LayerImage.__proto__ || Object.getPrototypeOf(LayerImage)).call(this, obj));

    if (obj.content !== undefined) {
      _this.fileID = _TimelineConfig2.default.fileID(obj.content.source);
      _this.file = _TimelineConfig2.default.images[_this.fileID];
    }
    return _this;
  }

  return LayerImage;
}(_Layer3.default);

exports.default = LayerImage;