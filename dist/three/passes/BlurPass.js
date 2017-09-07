'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var glsl = require('glslify');

module.exports = function (THREE) {
  require('../EffectComposer')(THREE);

  var BlurPass = function (_THREE$ShaderPass) {
    _inherits(BlurPass, _THREE$ShaderPass);

    function BlurPass(camera) {
      _classCallCheck(this, BlurPass);

      var w = window.innerWidth;
      var h = window.innerHeight;

      var _this = _possibleConstructorReturn(this, (BlurPass.__proto__ || Object.getPrototypeOf(BlurPass)).call(this, {
        uniforms: {
          aspect: { value: camera.aspect },
          tDiffuse: {
            type: 't'
          },
          radius: {
            type: 'f',
            value: 0.0
          },
          resolution: {
            type: '2f',
            value: new THREE.Vector2(w, h)
          },
          dir: {
            type: '2f',
            value: new THREE.Vector2(1.0, 1.0)
          }
        },
        vertexShader: '#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
        fragmentShader: '#define GLSLIFY 1\nvarying vec2 vUv;\n\nuniform sampler2D tDiffuse;\nuniform float aspect;\nuniform float radius;\nuniform vec2 resolution;\nuniform vec2 dir;\n\nvec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.411764705882353) * direction;\n  vec2 off2 = vec2(3.2941176470588234) * direction;\n  vec2 off3 = vec2(5.176470588235294) * direction;\n  color += texture2D(image, uv) * 0.1964825501511404;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n  return color;\n}\n\nvec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.3333333333333333) * direction;\n  color += texture2D(image, uv) * 0.29411764705882354;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;\n  return color; \n}\n\n#ifdef LOW_QUALITY\n  #define blur blur5\n#else\n  #define blur blur13\n#endif\n\nvoid main() {\n  if(radius > 0.0) {\n    gl_FragColor.rgb = blur(tDiffuse, vUv, resolution, dir * radius).rgb;\n  } else {\n    gl_FragColor.rgb = texture2D(tDiffuse, vUv).rgb;\n  }\n  gl_FragColor.a = 1.0;\n}'
      }));

      var parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
      };
      _this.renderTarget = new THREE.WebGLRenderTarget(w, h, parameters);
      _this.uniforms = _this.material.uniforms;
      return _this;
    }

    _createClass(BlurPass, [{
      key: 'render',
      value: function render(renderer, writeBuffer, readBuffer, delta) {
        this.uniforms[this.textureID].value = readBuffer;

        this.quad.material = this.material;

        var x = this.uniforms.dir.value.x;
        var y = this.uniforms.dir.value.y;

        this.uniforms.dir.value.set(x, 0);
        renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

        this.uniforms[this.textureID].value = this.renderTarget;
        this.uniforms.dir.value.set(0, y);

        if (this.renderToScreen) {
          renderer.render(this.scene, this.camera);
        } else {
          renderer.render(this.scene, this.camera, writeBuffer, this.clear);
        }

        this.uniforms.dir.value.set(x, y);
      }
    }, {
      key: 'setSize',
      value: function setSize(w, h) {
        this.uniforms.resolution.value.set(w, h);
      }
    }]);

    return BlurPass;
  }(THREE.ShaderPass);

  return BlurPass;
};