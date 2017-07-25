"use strict";

module.exports = function (THREE) {
    var THREEFBO = {
        fbos: [],
        post: [],

        addFBO: function addFBO(obj, func) {
            this.fbos.push({
                target: obj,
                call: func
            });
        },

        addPost: function addPost(obj, func) {
            this.post.push({
                target: obj,
                call: func
            });
        },

        create: function create(width, height, format) {
            var s = window.devicePixelRatio;
            var w = (width !== undefined ? width : window.innerWidth) * s;
            var h = (height !== undefined ? height : window.innerHeight) * s;
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

        update: function update() {
            var i = void 0,
                total = this.fbos.length;
            for (i = 0; i < total; ++i) {
                var n = this.fbos[i];
                n.target[n.call]();
            }
            this.fbos = [];
        },

        postRender: function postRender() {
            var i = void 0,
                total = this.post.length;
            for (i = 0; i < total; ++i) {
                var n = this.post[i];
                n.target[n.call]();
            }
            this.post = [];
        }
    };

    return THREEFBO;
};