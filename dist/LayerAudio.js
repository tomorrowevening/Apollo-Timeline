'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Loader = require('apollo-utils/Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _TimelineConfig = require('./TimelineConfig');

var _TimelineConfig2 = _interopRequireDefault(_TimelineConfig);

var _Layer2 = require('./Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LayerAudio = function (_Layer) {
  _inherits(LayerAudio, _Layer);

  function LayerAudio(obj) {
    _classCallCheck(this, LayerAudio);

    var _this = _possibleConstructorReturn(this, (LayerAudio.__proto__ || Object.getPrototypeOf(LayerAudio)).call(this, obj));

    _this.timestamp = 0;

    if (obj.content !== undefined) {
      _this.fileID = _TimelineConfig2.default.fileID(obj.content.source);
      _this.file = _TimelineConfig2.default.audio[_this.fileID];
    }
    return _this;
  }

  _createClass(LayerAudio, [{
    key: 'update',
    value: function update(time) {
      var now = Date.now();
      var delta = (now - this.timestamp) / 1000;

      if (delta > 1) {
        this.file.play();
        _Loader2.default.playAudio(this.fileID);
      }

      this.timestamp = now;
    }
  }]);

  return LayerAudio;
}(_Layer3.default);

exports.default = LayerAudio;