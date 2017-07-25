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
    var THREEVideo = function (_THREELayer) {
        _inherits(THREEVideo, _THREELayer);

        function THREEVideo(json, timeline) {
            _classCallCheck(this, THREEVideo);

            var _this = _possibleConstructorReturn(this, (THREEVideo.__proto__ || Object.getPrototypeOf(THREEVideo)).call(this, json, timeline));

            var src = json.content.source;
            _this.fileID = _Config2.default.fileID(src);
            _this.file = _Config2.default.video[_this.fileID];
            _this.file.autoplay = false;
            _this.file.pause();

            var texture = new THREE.VideoTexture(_this.file);
            var geometry = new THREE.PlaneGeometry(json.content.width, json.content.height);

            geometry.computeBoundingBox();
            var box = geometry.boundingBox;
            var w = (box.max.x - box.min.x) / 2;
            var h = (box.max.y - box.min.y) / 2;
            var d = 0;
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(w, -h, -d));

            var material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                depthTest: false
            });

            _this.mesh = new THREE.Mesh(geometry, material);
            _this.item.add(_this.mesh);
            _THREELayer3.default.transform(_this.item, _this.mesh, json.transform, timeline);
            return _this;
        }

        return THREEVideo;
    }(_THREELayer3.default);

    return THREEVideo;
};