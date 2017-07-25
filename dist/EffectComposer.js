"use strict";

module.exports = function (THREE) {

    THREE.EffectComposer = function (renderer, renderTarget) {

        this.renderer = renderer;

        if (renderTarget === undefined) {

            var parameters = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                stencilBuffer: false
            };
            var size = renderer.getSize();
            renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, parameters);
        }

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        this.passes = [];

        if (THREE.CopyShader === undefined) console.error("THREE.EffectComposer relies on THREE.CopyShader");

        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
    };

    Object.assign(THREE.EffectComposer.prototype, {

        swapBuffers: function swapBuffers() {

            var tmp = this.readBuffer;
            this.readBuffer = this.writeBuffer;
            this.writeBuffer = tmp;
        },

        addPass: function addPass(pass) {

            this.passes.push(pass);

            var size = this.renderer.getSize();
            pass.setSize(size.width, size.height);
        },

        insertPass: function insertPass(pass, index) {

            this.passes.splice(index, 0, pass);
        },

        render: function render(delta) {

            var maskActive = false;

            var pass,
                i,
                il = this.passes.length;

            for (i = 0; i < il; i++) {

                pass = this.passes[i];

                if (pass.enabled === false) continue;

                pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

                if (pass.needsSwap) {

                    if (maskActive) {

                        var context = this.renderer.context;

                        context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

                        this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);

                        context.stencilFunc(context.EQUAL, 1, 0xffffffff);
                    }

                    this.swapBuffers();
                }

                if (pass instanceof THREE.MaskPass) {

                    maskActive = true;
                } else if (pass instanceof THREE.ClearMaskPass) {

                    maskActive = false;
                }
            }
        },

        reset: function reset(renderTarget) {

            if (renderTarget === undefined) {

                var size = this.renderer.getSize();

                renderTarget = this.renderTarget1.clone();
                renderTarget.setSize(size.width, size.height);
            }

            this.renderTarget1.dispose();
            this.renderTarget2.dispose();
            this.renderTarget1 = renderTarget;
            this.renderTarget2 = renderTarget.clone();

            this.writeBuffer = this.renderTarget1;
            this.readBuffer = this.renderTarget2;
        },

        setSize: function setSize(width, height) {

            this.renderTarget1.setSize(width, height);
            this.renderTarget2.setSize(width, height);

            for (var i = 0; i < this.passes.length; i++) {

                this.passes[i].setSize(width, height);
            }
        }

    });

    THREE.Pass = function () {
        this.enabled = true;

        this.needsSwap = true;

        this.clear = false;

        this.renderToScreen = false;
    };

    Object.assign(THREE.Pass.prototype, {

        setSize: function setSize(width, height) {},

        render: function render(renderer, writeBuffer, readBuffer, delta, maskActive) {

            console.error("THREE.Pass: .render() must be implemented in derived pass.");
        }

    });

    THREE.RenderPass = function (scene, camera, overrideMaterial, clearColor, clearAlpha) {
        THREE.Pass.call(this);

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = overrideMaterial;

        this.clearColor = clearColor;
        this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 1;

        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;

        this.enabled = true;
        this.clear = true;
        this.needsSwap = false;
    };

    THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

        constructor: THREE.RenderPass,

        render: function render(renderer, writeBuffer, readBuffer, delta) {

            this.scene.overrideMaterial = this.overrideMaterial;

            if (this.clearColor) {

                this.oldClearColor.copy(renderer.getClearColor());
                this.oldClearAlpha = renderer.getClearAlpha();

                renderer.setClearColor(this.clearColor, this.clearAlpha);
            }

            renderer.render(this.scene, this.camera, readBuffer, this.clear);

            if (this.clearColor) {

                renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
            }

            this.scene.overrideMaterial = null;
        }

    });

    THREE.ShaderPass = function (shader, textureID) {
        THREE.Pass.call(this);

        this.textureID = textureID !== undefined ? textureID : "tDiffuse";

        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        this.material = new THREE.ShaderMaterial({

            defines: shader.defines || {},
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });

        this.renderToScreen = false;

        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene();

        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.scene.add(this.quad);
    };

    THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

        constructor: THREE.ShaderPass,

        render: function render(renderer, writeBuffer, readBuffer, delta) {

            if (this.uniforms[this.textureID]) {

                this.uniforms[this.textureID].value = readBuffer;
            }

            this.quad.material = this.material;

            if (this.renderToScreen) {

                renderer.render(this.scene, this.camera);
            } else {

                renderer.render(this.scene, this.camera, writeBuffer, this.clear);
            }
        }

    });

    THREE.MaskPass = function (scene, camera) {
        THREE.Pass.call(this);

        this.scene = scene;
        this.camera = camera;

        this.enabled = true;
        this.clear = true;
        this.needsSwap = false;

        this.inverse = false;
    };

    THREE.MaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

        constructor: THREE.MaskPass,

        render: function render(renderer, writeBuffer, readBuffer, delta) {

            var context = renderer.context;

            context.colorMask(false, false, false, false);
            context.depthMask(false);

            var writeValue, clearValue;

            if (this.inverse) {

                writeValue = 0;
                clearValue = 1;
            } else {

                writeValue = 1;
                clearValue = 0;
            }

            context.enable(context.STENCIL_TEST);
            context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
            context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
            context.clearStencil(clearValue);

            renderer.render(this.scene, this.camera, readBuffer, this.clear);
            renderer.render(this.scene, this.camera, writeBuffer, this.clear);

            context.colorMask(true, true, true, true);
            context.depthMask(true);

            context.stencilFunc(context.EQUAL, 1, 0xffffffff);
            context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
        }

    });

    THREE.ClearMaskPass = function () {
        THREE.Pass.call(this);

        this.enabled = true;
    };

    THREE.ClearMaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

        constructor: THREE.ClearMaskPass,

        render: function render(renderer, writeBuffer, readBuffer, delta) {

            var context = renderer.context;

            context.disable(context.STENCIL_TEST);
        }

    });

    THREE.SavePass = function (renderTarget) {

        THREE.ShaderPass.call(this);

        if (THREE.CopyShader === undefined) console.error("THREE.SavePass relies on THREE.CopyShader");

        var shader = THREE.CopyShader;

        this.textureID = "tDiffuse";

        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        this.material = new THREE.ShaderMaterial({

            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });

        this.renderTarget = renderTarget;

        if (this.renderTarget === undefined) {

            this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
            this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.renderTargetParameters);
        }

        this.needsSwap = false;

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene();

        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.scene.add(this.quad);
    };

    THREE.SavePass.prototype = Object.assign(Object.create(THREE.ShaderPass.prototype), {

        constructor: THREE.SavePass,

        render: function render(renderer, writeBuffer, readBuffer, delta, maskActive) {

            if (this.uniforms[this.textureID]) {

                this.uniforms[this.textureID].value = readBuffer;
            }

            this.quad.material = this.material;

            renderer.render(this.scene, this.camera, this.renderTarget, this.clear);
        }

    });

    THREE.BloomPass = function (strength, kernelSize, sigma, resolution) {
        THREE.Pass.call(this);

        strength = strength !== undefined ? strength : 1;
        kernelSize = kernelSize !== undefined ? kernelSize : 25;
        sigma = sigma !== undefined ? sigma : 4.0;
        resolution = resolution !== undefined ? resolution : 256;

        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

        this.renderTargetX = new THREE.WebGLRenderTarget(resolution, resolution, pars);
        this.renderTargetY = new THREE.WebGLRenderTarget(resolution, resolution, pars);

        if (THREE.CopyShader === undefined) console.error("THREE.BloomPass relies on THREE.CopyShader");

        var copyShader = THREE.CopyShader;

        this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);

        this.copyUniforms["opacity"].value = strength;

        this.materialCopy = new THREE.ShaderMaterial({

            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true

        });

        if (THREE.ConvolutionShader === undefined) console.error("THREE.BloomPass relies on THREE.ConvolutionShader");

        var convolutionShader = THREE.ConvolutionShader;

        this.convolutionUniforms = THREE.UniformsUtils.clone(convolutionShader.uniforms);

        this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurX;
        this.convolutionUniforms["cKernel"].value = THREE.ConvolutionShader.buildKernel(sigma);

        this.materialConvolution = new THREE.ShaderMaterial({

            uniforms: this.convolutionUniforms,
            vertexShader: convolutionShader.vertexShader,
            fragmentShader: convolutionShader.fragmentShader,
            defines: {
                "KERNEL_SIZE_FLOAT": kernelSize.toFixed(1),
                "KERNEL_SIZE_INT": kernelSize.toFixed(0)
            }

        });

        this.enabled = true;
        this.needsSwap = false;
        this.clear = false;

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene();

        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.scene.add(this.quad);
    };

    THREE.BloomPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

        constructor: THREE.BloomPass,

        render: function render(renderer, writeBuffer, readBuffer, delta, maskActive) {

            if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

            this.quad.material = this.materialConvolution;

            this.convolutionUniforms["tDiffuse"].value = readBuffer;
            this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurX;

            renderer.render(this.scene, this.camera, this.renderTargetX, true);

            this.convolutionUniforms["tDiffuse"].value = this.renderTargetX;
            this.convolutionUniforms["uImageIncrement"].value = THREE.BloomPass.blurY;

            renderer.render(this.scene, this.camera, this.renderTargetY, true);

            this.quad.material = this.materialCopy;

            this.copyUniforms["tDiffuse"].value = this.renderTargetY;

            if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

            renderer.render(this.scene, this.camera, readBuffer, this.clear);
        }

    });

    THREE.BloomPass.blurX = new THREE.Vector2(0.001953125, 0.0);
    THREE.BloomPass.blurY = new THREE.Vector2(0.0, 0.001953125);

    THREE.BlendShader = {

        uniforms: {

            "tDiffuse1": { type: "t", value: null },
            "tDiffuse2": { type: "t", value: null },
            "mixRatio": { type: "f", value: 0.5 },
            "opacity": { type: "f", value: 1.0 }

        },

        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

        fragmentShader: ["uniform float opacity;", "uniform float mixRatio;", "uniform sampler2D tDiffuse1;", "uniform sampler2D tDiffuse2;", "varying vec2 vUv;", "void main() {", "vec4 texel1 = texture2D( tDiffuse1, vUv );", "vec4 texel2 = texture2D( tDiffuse2, vUv );", "gl_FragColor = opacity * mix( texel1, texel2, mixRatio );", "}"].join("\n")

    };

    THREE.CopyShader = {

        uniforms: {

            "tDiffuse": { type: "t", value: null },
            "opacity": { type: "f", value: 1.0 }

        },

        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

        fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")

    };

    THREE.ConvolutionShader = {

        defines: {

            "KERNEL_SIZE_FLOAT": "25.0",
            "KERNEL_SIZE_INT": "25"

        },

        uniforms: {

            "tDiffuse": { type: "t", value: null },
            "uImageIncrement": { type: "v2", value: new THREE.Vector2(0.001953125, 0.0) },
            "cKernel": { type: "fv1", value: [] }

        },

        vertexShader: ["uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

        fragmentShader: ["uniform float cKernel[ KERNEL_SIZE_INT ];", "uniform sampler2D tDiffuse;", "uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vec2 imageCoord = vUv;", "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );", "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {", "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];", "imageCoord += uImageIncrement;", "}", "gl_FragColor = sum;", "}"].join("\n"),

        buildKernel: function buildKernel(sigma) {

            function gauss(x, sigma) {

                return Math.exp(-(x * x) / (2.0 * sigma * sigma));
            }

            var i,
                values,
                sum,
                halfWidth,
                kMaxKernelSize = 25,
                kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

            if (kernelSize > kMaxKernelSize) kernelSize = kMaxKernelSize;
            halfWidth = (kernelSize - 1) * 0.5;

            values = new Array(kernelSize);
            sum = 0.0;
            for (i = 0; i < kernelSize; ++i) {

                values[i] = gauss(i - halfWidth, sigma);
                sum += values[i];
            }

            for (i = 0; i < kernelSize; ++i) {
                values[i] /= sum;
            }return values;
        }

    };
};