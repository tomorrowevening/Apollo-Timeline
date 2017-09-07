module.exports = function(THREE) {
  function setupPostEffects(scene, camera, renderer) {
    const pixelRatio = renderer.getPixelRatio();
    const width  = Math.floor(renderer.context.canvas.width  / pixelRatio) || 1;
    const height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;
    const parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };
    var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
    
    const post = {
      effects: [],
      enabled: false,
      composer: new THREE.EffectComposer( renderer, renderTarget ),
      copy: new THREE.ShaderPass( THREE.CopyShader ),
      resize: function(w, h) {
        const dpr = window.devicePixelRatio;
        this.composer.setSize(w * dpr, h * dpr);
        this.effects.forEach((effect) => {
          effect.setSize(w, h);
        });
      },
      add: function(effect, index) {
        this.effects.push(effect);
        
        if(index === undefined) {
          index = this.composer.passes.length-1;
        }
        this.composer.passes.splice(index, 0, effect);
        
        if(effect.renderToScreen) {
          this.copy.enabled = false;
        }
      }
    };
    
    let renderPass = new THREE.RenderPass(scene, camera);
    post.composer.addPass( renderPass );
    
    post.copy.renderToScreen       = true;
    post.copy.material.transparent = true;
    post.composer.addPass(post.copy);
    
    post.composer.setSize( width * pixelRatio, height * pixelRatio );
    
    return post;
  }
  
  return setupPostEffects;
}