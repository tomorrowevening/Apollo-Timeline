'use strict';

var _TimelineConfig = require('../TimelineConfig');

var _TimelineConfig2 = _interopRequireDefault(_TimelineConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
  require('apollo-utils/ThreeUtil')(THREE);
  var THREELayer = require('./THREELayer')(THREE);

  var THREEImage = function (_THREELayer) {
    _inherits(THREEImage, _THREELayer);

    function THREEImage(json, timeline) {
      _classCallCheck(this, THREEImage);

      var _this = _possibleConstructorReturn(this, (THREEImage.__proto__ || Object.getPrototypeOf(THREEImage)).call(this, json, timeline));

      var url = json.content.source;
      var fileID = _TimelineConfig2.default.fileID(url);
      var image = _TimelineConfig2.default.images[fileID];
      var texture = _TimelineConfig2.default.textures[fileID];
      var transparent = url.search('.png') > -1;

      var geometry = new THREE.PlaneGeometry(image.width, image.height);
      geometry.topLeftAnchor(true);

      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: transparent,
        side: THREE.DoubleSide });

      _this.mesh = new THREE.Mesh(geometry, material);
      _this.item.add(_this.mesh);
      THREELayer.transform(_this.item, _this.mesh, json.transform, timeline);
      return _this;
    }

    return THREEImage;
  }(THREELayer);

  return THREEImage;
};