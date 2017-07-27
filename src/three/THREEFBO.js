module.exports = function(THREE) {
  const THREEFBO = {
    fbos: [], // list of function calls
    post: [], // list of function calls

    addFBO: function(obj, func) {
      this.fbos.push({
        target: obj,
        call: func
      });
    },

    addPost: function(obj, func) {
      this.post.push({
        target: obj,
        call: func
      });
    },

    create: function(width, height, format) {
      const s = window.devicePixelRatio;
      const w = (width !== undefined ? width : window.innerWidth) * s;
      const h = (height !== undefined ? height : window.innerHeight) * s;
      var fbo = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: format !== undefined ? format : THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false
      });
      fbo.texture.generateMipmaps = false;
      return fbo;
    },

    update: function() {
      let i, total = this.fbos.length;
      for(i = 0; i < total; ++i) {
        let n = this.fbos[i];
        n.target[n.call]();
      }
      this.fbos = [];
    },

    postRender: function() {
      let i, total = this.post.length;
      for(i = 0; i < total; ++i) {
        let n = this.post[i];
        n.target[n.call]();
      }
      this.post = [];
    }
  };

  return THREEFBO;
}
