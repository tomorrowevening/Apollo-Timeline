'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glsl = require('glslify');

module.exports = function (THREE) {
  require('../EffectComposer')(THREE);

  var TrackMattePass = function (_THREE$ShaderPass) {
    _inherits(TrackMattePass, _THREE$ShaderPass);

    function TrackMattePass(opt) {
      _classCallCheck(this, TrackMattePass);

      if (opt === undefined) opt = {};
      var matte = opt.matte;
      var type = opt.type !== undefined ? opt.type : 0;
      var anchor = opt.anchor !== undefined ? new THREE.Vector2(opt.anchor[0], opt.anchor[1]) : new THREE.Vector2(0, 0);
      var position = opt.position !== undefined ? new THREE.Vector2(opt.position[0], opt.position[1]) : new THREE.Vector2(0, 0);
      var scale = opt.scale !== undefined ? new THREE.Vector2(opt.scale[0], opt.scale[1]) : new THREE.Vector2(1, 1);
      var rotation = opt.rotation !== undefined ? opt.rotation : 0;
      var opacity = opt.opacity !== undefined ? opt.opacity : 1;
      return _possibleConstructorReturn(this, (TrackMattePass.__proto__ || Object.getPrototypeOf(TrackMattePass)).call(this, {
        uniforms: {
          tDiffuse: { type: 't', value: null },
          tMatte: { type: 't', value: matte },
          uType: { type: 'f', value: type },
          uAnchor: { type: 'v2', value: anchor },
          uSize: { type: 'v4', value: new THREE.Vector4(1, 1, 1, 1) },
          uPosition: { type: 'v2', value: position },
          uScale: { type: 'v2', value: scale },
          uRotation: { type: 'f', value: rotation }
        },
        vertexShader: '#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
        fragmentShader: '#define GLSLIFY 1\nuniform sampler2D tDiffuse;\nuniform sampler2D tMatte;\nuniform float uType;\nuniform vec2 uAnchor;\nuniform vec2 uPosition;\nuniform vec4 uSize;\nuniform vec2 uScale;\nuniform float uRotation;\n// uniform float matteOpacity;\n\nvarying vec2 vUv;\n\n// float luma(vec3 color) {\n//   return dot(color, vec3(0.299, 0.587, 0.114));\n// }\n\nmat2 rotate2d(float _angle){\n  return mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle));\n}\n\nmat2 scale2d(vec2 _scale) {\n  return mat2(_scale.x, 0.0, 0.0, _scale.y);\n}\n\nvoid main() {\n  vec4 color = texture2D(tDiffuse, vUv);\n  \n  // uType = 0 = No Track Matte\n  // uType = 1 = Alpha Matte\n  // uType = 2 = Alpha Inverted Matte\n  // uType = 3 = Luma Matte\n  // uType = 4 = Luma Inverted Matte\n  if(uType > 0.0) {\n    vec2 resolution = vec2(uSize.z, uSize.a);\n    vec2 uv = vUv / (uSize.xy / resolution);\n    \n    uv += uAnchor / resolution;\n    uv = rotate2d(radians(uRotation)) * uv;\n    uv -= uPosition / resolution;\n    // uv = scale2d(uScale) * uv;\n    \n    vec4 matte = texture2D(tMatte, uv);\n    color += matte * 0.5;\n    // if(uType == 1.0) {\n    //   color.a *= matte.a;\n    // } else if(uType == 2.0) {\n    //   color.a *= (1.0 - matte.a);\n    // } else if(uType == 3.0) {\n    //   color.a *= luma(matte.xyz);\n    // } else if(uType == 4.0) {\n    //   color.a *= 1.0 - luma(matte.xyz);\n    // }\n    // color.a *= matteOpacity;\n    \n    if(uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {\n      color.a = 0.0;\n    }\n  }\n  gl_FragColor = color;\n}\n',
        transparent: true
      }));
    }

    _createClass(TrackMattePass, [{
      key: 'setSize',
      value: function setSize(w, h) {
        if (this.uniforms.tMatte.value !== undefined || this.uniforms.tMatte.value !== null) {
          this.uniforms.uSize.value.x = this.uniforms.tMatte.value.image.width;
          this.uniforms.uSize.value.y = this.uniforms.tMatte.value.image.height;
        }

        this.uniforms.uSize.value.z = w;
        this.uniforms.uSize.value.w = h;
      }
    }]);

    return TrackMattePass;
  }(THREE.ShaderPass);

  return TrackMattePass;
};