var THREE       = require('three');
var MathU       = require('apollo-utils/MathUtil');
var ThreeU      = require('apollo-utils/ThreeUtil');
var Loader      = require('apollo-utils/Loader');
var Composition = require('apollo-timeline/Composition');
var THREELayer  = require('./THREELayer').THREELayer;
var THREEImage  = require('./THREELayer').THREEImage;
var THREEShape  = require('./THREELayer').THREEShape;
var THREEText   = require('./THREELayer').THREEText;


function THREEComposition(json, renderer) {
    Composition.call(this, json);
    
    this.renderer   = renderer;
    this.item       = new THREE.Scene();
    this.post       = {
        enabled : true,
        effects : [],
        composer: undefined,
        render  : undefined,
        copy    : undefined,
        get     : function( name ) {
            let i, total = this.effects.length;
            for(i = 0; i < total; ++i) {
                let e = this.effects[i];
                if(e.name === name) return e;
            }
            return undefined;
        }
    };
    
    this.dispose = function() {
        this.item.dispose();
        this.timeline.dispose();
        this.camera = undefined;
        this.layers = [];
    }
    
    this.setupPerspectiveCam = function() {
        const fov = 60;
        const wid = this.renderer.domElement.width;
        const hei = this.renderer.domElement.height;
        this.camera = new THREE.PerspectiveCamera(fov, wid/hei, 1, 3500);
        this.camera.position.set(0, 0, 1000);
    }
    
    this.setupOrthoCam = function() {
        const wid = this.renderer.domElement.width;
        const hei = this.renderer.domElement.height;
        this.camera = new THREE.OrthographicCamera( wid / - 2, wid / 2, hei / 2, hei / - 2, 1, 3500 );
        this.camera.position.set(0, 0, 1000);
    }
    
    this.setupPost = function() {
        const pixelRatio = this.renderer.getPixelRatio();
        const width  = Math.floor( this.renderer.context.canvas.width  / pixelRatio ) || 1;
        const height = Math.floor( this.renderer.context.canvas.height / pixelRatio ) || 1;
        const parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        var renderTarget   = new THREE.WebGLRenderTarget( width, height, parameters );
        this.post.composer = new THREE.EffectComposer( this.renderer, renderTarget );
        this.post.render   = new THREE.RenderPass( this.scene, this.camera );
        this.post.copy     = new THREE.ShaderPass( THREE.CopyShader );
        
        this.post.copy.renderToScreen       = true;
        this.post.copy.material.transparent = true;
        
        this.post.composer.addPass( this.post.render );
        
        this.setupEffects();
        
        // Apply
        const total = this.post.effects.length;
        for(let i = 0; i < total; ++i) {
            this.post.composer.addPass( this.post.effects[i] );
        }

        this.post.composer.addPass( this.post.copy );
    }
    
    this.setupEffects = function() {
    }
    
    this.buildLayerComposition = function(json) {
        let cJSON = Loader.json.project.compositions[json.name];
        let atlas = Loader.json.atlas.compositions[ json.name ];
        let layer = new THREEComposition( json, this.renderer );
        layer.build( cJSON, this );
        layer.buildAtlas(atlas);
        this.item.add( layer.item );
        return layer;
    }
    
    this.buildLayerImage = function(json) {
        let layer  = new THREEImage( json, this.timeline );
        this.item.add( layer.item );
        return layer;
    }
    
    this.buildLayerShape = function(json) {
        let layer  = new THREEShape( json, this.timeline );
        this.item.add( layer.item );
        return layer;
    }
    
    this.buildLayerText = function(json) {
        let layer = new THREEText( json, this.timeline );
        this.item.add( layer.item );
        return layer;
    }
    
    this.draw = function() {
        if( this.post.enabled && this.post.effects.length > 0 ) {
            this.post.composer.render();
        } else {
            this.renderer.render( this.item, this.camera );
        }
    }
    
    this.update = function() {
        if(!this.timeline.playing) return false;
        this.updateLayers();
        this.updateCamera();
    }
    
    this.updateCamera = function() {
        const w = this.renderer.domElement.width;
        const h = this.renderer.domElement.height;
        const a = w / h;
        
        const isOrtho = this.camera instanceof THREE.OrthographicCamera;
        if(isOrtho) {
            this.camera.left   = w / -2;
            this.camera.right  = w /  2;
            this.camera.top    = h /  2;
            this.camera.bottom = h / -2;
            
            // Centered
            this.camera.position.x = w /  2;
            this.camera.position.y = h / -2;
        } else {
            this.camera.aspect = a;
        }
        
        this.camera.updateProjectionMatrix();
    }
    
    this.setupOrthoCam();
}
THREEComposition.prototype = Object.create( Composition.prototype );
THREEComposition.prototype.constructor = THREEComposition;

module.exports = THREEComposition;
