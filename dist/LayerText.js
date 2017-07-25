'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LayerText = undefined;

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LayerText = exports.LayerText = function (_Layer) {
    _inherits(LayerText, _Layer);

    function LayerText(obj) {
        _classCallCheck(this, LayerText);

        return _possibleConstructorReturn(this, (LayerText.__proto__ || Object.getPrototypeOf(LayerText)).call(this, obj));
    }

    return LayerText;
}(_Layer3.default);