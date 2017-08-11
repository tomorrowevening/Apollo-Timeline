import { toRad } from 'apollo-utils/MathUtil';
import Keyframe from '../Keyframe';
import Composition from '../Composition';

module.exports = function(THREE) {
  var THREEImage = require('./THREEImage')(THREE);
  var THREEShape = require('./THREEShape')(THREE);
  var txt = require('./THREEText')(THREE);
  var THREETextLayer = txt.THREETextLayer;
  var THREEVideo = require('./THREEVideo')(THREE);
  require('./EffectComposer')(THREE);
  
  class THREEComposition extends Composition {
    constructor(json, renderer) {
      super(json);
      
      this.renderer = renderer;
      this.item = new THREE.Scene();
      this.setupPerspectiveCam();
      this.setupPost();
    }
    
    setupPerspectiveCam() {
      const fov = 60;
      const wid = this.renderer.domElement.width;
      const hei = this.renderer.domElement.height;
      this.camera = new THREE.PerspectiveCamera(fov, wid/hei, 1, 3500);
      this.camera.position.set(0, 0, 1000);
    }
    
    setupOrthoCam() {
      const wid = this.renderer.domElement.width;
      const hei = this.renderer.domElement.height;
      this.camera = new THREE.OrthographicCamera( wid / - 2, wid / 2, hei / 2, hei / - 2, 1, 3500 );
      this.camera.position.set(0, 0, 1000);
    }
    
    setupEffects() {
      //
    }
    
    setupPost() {
      this.post = {
        effects : [],
        enabled : true,
        composer: undefined,
        resize  : function(w, h) {
          const dpr = this.renderer.getPixelRatio();
          this.composer.setSize(w * dpr, h * dpr);
          this.effects.forEach(pass => {
            pass.setSize(w, h);
          });
        },
        getLastPass: function() {
          return this.composer.passes[this.composer.passes.length-1];
        }
      };

      // Setup
      const pixelRatio = this.renderer.getPixelRatio();
      const width  = Math.floor(this.renderer.context.canvas.width  / pixelRatio) || 1;
      const height = Math.floor(this.renderer.context.canvas.height / pixelRatio) || 1;
      const parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
      };
      var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
      this.post.composer = new THREE.EffectComposer( this.renderer, renderTarget );
      let renderPass = new THREE.RenderPass(this.item, this.camera);
      let copyPass = new THREE.ShaderPass( THREE.CopyShader );

      copyPass.renderToScreen       = true;
      copyPass.material.transparent = true;

      this.post.composer.addPass( renderPass );

      // Apply
      const total = this.post.effects.length;
      for(let i = 0; i < total; ++i) {
          this.post.composer.addPass(this.post.effects[i]);
      }

      // this.post.composer.addPass( copyPass );
      this.post.composer.setSize( width * pixelRatio, height * pixelRatio );
    }
    
    update(time) {
      // if(!this.timeline.playing) return;
      this.timeline.update();
      this.updateLayers();
      this.updateCamera();
    }
    
    draw() {
      if(this.post.enabled && this.post.effects.length > 0) {
        this.post.composer.render();
      } else {
        this.renderer.render(this.item, this.camera);
      }
    }
    
    updateCamera() {
      const w = this.renderer.domElement.width;
      const h = this.renderer.domElement.height;
      const a = w / h;
      
      const isOrtho = this.camera instanceof THREE.OrthographicCamera;
      if(isOrtho) {
        this.camera.left   = w / -2;
        this.camera.right  = w /  2;
        this.camera.top    = h /  2;
        this.camera.bottom = h / -2;
      } else {
        const dist = this.camera.position.z;
        const fov  = 2 * Math.atan( ( w / a ) / ( 2 * dist ) ) * ( 180 / Math.PI );
        this.camera.fov = fov;
      }
      
      this.camera.position.x = w /  2;
      this.camera.position.y = h / -2;
      
      this.camera.aspect = a;
      this.camera.updateProjectionMatrix();
    }
    
    // Build
    
    buildLayerComposition(json) {
      let cJSON = Loader.json.project.compositions[json.name];
      let atlas = Loader.json.atlas.compositions[json.name];
      let layer = new THREEComposition(json, this.renderer);
      layer.build(cJSON, this);
      layer.buildAtlas(atlas);
      return layer;
    }
    
    buildLayerImage(json) {
      let layer = new THREEImage( json, this.timeline );
      this.item.add( layer.item );
      return layer;
    }
    
    buildLayerShape(json) {
      let layer = new THREEShape( json, this.timeline );
      this.item.add( layer.item );
      return layer;
    }
    
    buildLayerText(json) {
      let layer = new THREETextLayer( json, this.timeline );
      this.item.add( layer.item );
      return layer;
    }
    
    buildLayerVideo(json) {
      let layer = new THREEVideo( json, this.timeline );
      this.item.add( layer.item );
      return layer;
    }
  }
  
  return THREEComposition;
}