'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LayerVideo = undefined;

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LayerVideo = exports.LayerVideo = function (_Layer) {
    _inherits(LayerVideo, _Layer);

    function LayerVideo(obj) {
        _classCallCheck(this, LayerVideo);

        var _this = _possibleConstructorReturn(this, (LayerVideo.__proto__ || Object.getPrototypeOf(LayerVideo)).call(this, obj));

        _this.timeStamp = 0;

        if (obj.content !== undefined) {
            _this.fileID = _Config2.default.fileID(obj.content.source);
            _this.file = _Config2.default.video[_this.fileID];
        }
        return _this;
    }

    return LayerVideo;
}(_Layer3.default);