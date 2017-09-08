"use strict";

module.exports = function (THREE) {
  function setupPostEffects(scene, camera, renderer) {
    var pixelRatio = renderer.getPixelRatio();
    var width = Math.floor(renderer.context.canvas.width / pixelRatio) || 1;
    var height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    };
    var renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);

    var post = {
      effects: [],
      enabled: false,
      composer: new THREE.EffectComposer(renderer, renderTarget),
      copy: new THREE.ShaderPass(THREE.CopyShader),
      resize: function resize(w, h) {
        var dpr = window.devicePixelRatio;
        this.composer.setSize(w * dpr, h * dpr);
        this.effects.forEach(function (effect) {
          effect.setSize(w, h);
        });
      },
      add: function add(effect, index) {
        this.effects.push(effect);

        if (index === undefined) {
          index = this.composer.passes.length - 1;
        }
        this.composer.passes.splice(index, 0, effect);

        if (effect.renderToScreen) {
          this.copy.enabled = false;
        }
      }
    };

    var renderPass = new THREE.RenderPass(scene, camera);
    post.composer.addPass(renderPass);

    post.copy.renderToScreen = true;
    post.copy.material.transparent = true;
    post.composer.addPass(post.copy);

    post.composer.setSize(width * pixelRatio, height * pixelRatio);

    return post;
  }

  return setupPostEffects;
};