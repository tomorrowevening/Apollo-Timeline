var glsl = require('glslify');

module.exports = function(THREE) {
  require('../EffectComposer')(THREE);

  class BlurPass extends THREE.ShaderPass {
    constructor(camera) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      super({
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
        vertexShader  : glsl("../glsl/default.vert"),
        fragmentShader: glsl("../glsl/blur.frag")
      });
      
      var parameters = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: false
      };
      this.renderTarget = new THREE.WebGLRenderTarget(w, h, parameters);
      this.uniforms = this.material.uniforms;
    }
    
    render(renderer, writeBuffer, readBuffer, delta) {
      this.uniforms[this.textureID].value = readBuffer;

      this.quad.material = this.material;
      
      let x = this.uniforms.dir.value.x;
      let y = this.uniforms.dir.value.y;
      
      this.uniforms.dir.value.set(x, 0);
      renderer.render(this.scene, this.camera, this.renderTarget, this.clear);
      
      this.uniforms[this.textureID].value = this.renderTarget;
      this.uniforms.dir.value.set(0, y);
      
      if(this.renderToScreen) {
        renderer.render(this.scene, this.camera);
      } else {
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);
      }
      
      this.uniforms.dir.value.set(x, y);
    }
    
    setSize(w, h) {
      this.uniforms.resolution.value.set(w, h);
    }
  }
  
  return BlurPass;
}
