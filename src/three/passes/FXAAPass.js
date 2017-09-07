var glsl = require('glslify');

module.exports = function(THREE) {
  require('../EffectComposer')(THREE);
  
  let dpr = 1;

  class FXAAPass extends THREE.ShaderPass {
    constructor(renderer) {
      super({
        uniforms: {
          tDiffuse    : { type: 't',  value: null },
          resolution  : { type: 'v2', value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }
        },
        vertexShader  : glsl("../glsl/default.vert"),
        fragmentShader: glsl("../glsl/FXAA.frag")
      });
      if(renderer !== undefined) {
        dpr = renderer.getPixelRatio();
      }
    }

    setSize(w, h) {
      this.uniforms.resolution.value.set(1/(w*dpr), 1/(h*dpr));
    }
  }

  return FXAAPass;
}