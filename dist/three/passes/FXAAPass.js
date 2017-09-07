'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glsl = require('glslify');

module.exports = function (THREE) {
  require('../EffectComposer')(THREE);

  var dpr = 1;

  var FXAAPass = function (_THREE$ShaderPass) {
    _inherits(FXAAPass, _THREE$ShaderPass);

    function FXAAPass(renderer) {
      _classCallCheck(this, FXAAPass);

      var _this = _possibleConstructorReturn(this, (FXAAPass.__proto__ || Object.getPrototypeOf(FXAAPass)).call(this, {
        uniforms: {
          tDiffuse: { type: 't', value: null },
          resolution: { type: 'v2', value: new THREE.Vector2(1 / 1024, 1 / 512) }
        },
        vertexShader: '#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
        fragmentShader: '#define GLSLIFY 1\nuniform sampler2D tDiffuse;\nuniform vec2 resolution;\n\n#define FXAA_REDUCE_MIN(1.0 / 128.0)# define FXAA_REDUCE_MUL(1.0 / 8.0)# define FXAA_SPAN_MAX 8.0\n\nvoid main() {\n\n  vec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * resolution).xyz;\n  vec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, -1.0)) * resolution).xyz;\n  vec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * resolution).xyz;\n  vec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, 1.0)) * resolution).xyz;\n  vec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy * resolution);\n  vec3 rgbM = rgbaM.xyz;\n  vec3 luma = vec3(0.299, 0.587, 0.114);\n\n  float lumaNW = dot(rgbNW, luma);\n  float lumaNE = dot(rgbNE, luma);\n  float lumaSW = dot(rgbSW, luma);\n  float lumaSE = dot(rgbSE, luma);\n  float lumaM = dot(rgbM, luma);\n  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n  vec2 dir;\n  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n    max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n      dir * rcpDirMin)) * resolution;\n  vec4 rgbA = (1.0 / 2.0) * (\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (1.0 / 3.0 - 0.5)) +\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (2.0 / 3.0 - 0.5)));\n  vec4 rgbB = rgbA * (1.0 / 2.0) + (1.0 / 4.0) * (\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (0.0 / 3.0 - 0.5)) +\n    texture2D(tDiffuse, gl_FragCoord.xy * resolution + dir * (3.0 / 3.0 - 0.5)));\n  float lumaB = dot(rgbB, vec4(luma, 0.0));\n\n  if((lumaB < lumaMin) || (lumaB > lumaMax)) {\n    gl_FragColor = rgbA;\n  } else {\n    gl_FragColor = rgbB;\n  }\n}'
      }));

      if (renderer !== undefined) {
        dpr = renderer.getPixelRatio();
      }
      return _this;
    }

    _createClass(FXAAPass, [{
      key: 'setSize',
      value: function setSize(w, h) {
        this.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
      }
    }]);

    return FXAAPass;
  }(THREE.ShaderPass);

  return FXAAPass;
};