var glsl = require('glslify');

module.exports = function(THREE) {
  require('../EffectComposer')(THREE);

  class TrackMattePass extends THREE.ShaderPass {
    constructor(opt) {
      if(opt === undefined) opt = {};
      let matte = opt.matte;
      let type = opt.type !== undefined ? opt.type : 0;
      let anchor = opt.anchor !== undefined ? new THREE.Vector2(opt.anchor[0], opt.anchor[1]) : new THREE.Vector2(0, 0);
      let position = opt.position !== undefined ? new THREE.Vector2(opt.position[0], opt.position[1]) : new THREE.Vector2(0, 0);
      let scale = opt.scale !== undefined ? new THREE.Vector2(opt.scale[0], opt.scale[1]) : new THREE.Vector2(1, 1);
      let rotation = opt.rotation !== undefined ? opt.rotation : 0;
      let opacity = opt.opacity !== undefined ? opt.opacity : 1;
      super({
        uniforms: {
          tDiffuse  : { type: 't',  value: null },
          tMatte    : { type: 't',  value: matte },
          uType     : { type: 'f',  value: type },
          uAnchor   : { type: 'v2', value: anchor},
          uSize     : { type: 'v4', value: new THREE.Vector4(1, 1, 1, 1)},
          uPosition : { type: 'v2', value: position},
          uScale    : { type: 'v2', value: scale},
          uRotation : { type: 'f',  value: rotation},
          // matteOpacity: { type: 'f',  value: opacity}
        },
        vertexShader  : glsl("../glsl/default.vert"),
        fragmentShader: glsl("../glsl/trackMatte.frag"),
        transparent: true
      });
    }
    
    setSize(w, h) {
      if(this.uniforms.tMatte.value !== undefined || this.uniforms.tMatte.value !== null) {
        this.uniforms.uSize.value.x = this.uniforms.tMatte.value.image.width;
        this.uniforms.uSize.value.y = this.uniforms.tMatte.value.image.height;
      }
      
      this.uniforms.uSize.value.z = w;
      this.uniforms.uSize.value.w = h;
    }
  }

  return TrackMattePass;
}