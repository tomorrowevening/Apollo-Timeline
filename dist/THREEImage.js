'use strict';

var _Config = require('../timeline/Config');

var _Config2 = _interopRequireDefault(_Config);

var _THREELayer2 = require('./THREELayer');

var _THREELayer3 = _interopRequireDefault(_THREELayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
    var THREEImage = function (_THREELayer) {
        _inherits(THREEImage, _THREELayer);

        function THREEImage(json, timeline) {
            _classCallCheck(this, THREEImage);

            var _this = _possibleConstructorReturn(this, (THREEImage.__proto__ || Object.getPrototypeOf(THREEImage)).call(this, json, timeline));

            var url = json.content.source;
            var fileID = _Config2.default.fileID(url);
            var image = _Config2.default.images[fileID];
            var texture = _Config2.default.textures[fileID];
            var transparent = url.search(".png") > -1;

            var geometry = new THREE.PlaneGeometry(image.width, image.height);

            geometry.computeBoundingBox();
            var box = geometry.boundingBox;
            var w = (box.max.x - box.min.x) / 2;
            var h = (box.max.y - box.min.y) / 2;
            var d = 0;
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(w, -h, -d));

            var material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: transparent,
                side: THREE.DoubleSide,
                depthTest: false
            });

            _this.mesh = new THREE.Mesh(geometry, material);
            _this.item.add(_this.mesh);
            _THREELayer3.default.transform(_this.item, _this.mesh, json.transform, timeline);
            return _this;
        }

        return THREEImage;
    }(_THREELayer3.default);

    return THREEImage;
};