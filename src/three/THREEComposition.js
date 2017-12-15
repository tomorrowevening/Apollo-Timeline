import Loader from 'apollo-utils/Loader';
import { toRad } from 'apollo-utils/MathUtil';
import Keyframe from '../Keyframe';
import Composition from '../Composition';
import TimelineConfig from '../TimelineConfig';

module.exports = function(THREE) {
  var THREELayer = require('./THREELayer')(THREE);
  var THREEImage = require('./THREEImage')(THREE);
  var THREEShape = require('./THREEShape')(THREE);
  var THREETextLayer = require('./THREEText')(THREE).THREETextLayer;
  var THREEVideo = require('./THREEVideo')(THREE);
  var setupPostEffects = require('./THREEPost')(THREE);
  // Effects
  require('./EffectComposer')(THREE);
  var BlurPass = require('./passes/BlurPass')(THREE);
  var TrackMattePass = require('./passes/TrackMattePass')(THREE);
  
  class THREEComposition extends Composition {
    constructor(json, renderer) {
      super(json);
      
      this.renderer = renderer;
      this.item = new THREE.Scene();
      this.setupPerspectiveCam();
      this.post = setupPostEffects(this.item, this.camera, renderer);
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
    }
    
    update(time, duration) {
      this.timeline.update(time, duration);
      this.updateLayers();
      this.updateCamera();
    }
    
    draw() {
      if(this.post.enabled && this.post.effects.length > 0) {
        this.post.composer.render();
      } else {
        this.renderer.render(this.item, this.camera);
      }
      
      const time = this.seconds;
      let total = this.layers.length;
      for (let i = 0; i < total; ++i) {
        let l = this.layers[i];
        let visible = l.showable(time);
        if(visible) l.draw();
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
    
    updateLayers() {
      const time = this.seconds;
      let total = this.layers.length;
      for (let i = 0; i < total; ++i) {
        let l = this.layers[i];
        let visible = l.showable(time);
        if (visible) {
          if (l instanceof Composition) {
            if (!l.showing && l.timeline.restartable) {
              l.play();
              // l.timeline.time.stamp = TIME.now();
            }
            l.update(time - l.start);
          } else {
            l.update(time - l.start);
          }
        } else if (l.showing && l instanceof Composition) {
          if (l.timeline.playing && l.timeline.seconds > 0) {
            l.timeline.seconds = l.timeline.duration;

            if (l.timeline.time.speed < 0) {
              l.timeline.seconds = 0;
            }

            if ((l.timeline.maxPlays > 0 && l.timeline.timesPlayed >= l.timeline.maxPlays) || l.timeline.mode === 'once') {
              l.timeline.playing = false;
            }
          }
        }
        l.showing = visible;
        
        l.item.visible = visible;
      }
    }
    
    resize(w, h) {
      this.post.resize(w, h);
      super.resize(w, h);
    }
    
    // Build
    
    applyEffects(effects) {
      effects.forEach((effect) => {
        let efft;
        if(effect.name === 'Gaussian Blur') {
          const multiplier = 0.067;
          efft = new BlurPass(this.camera);
          efft.uniforms.radius.value = effect.blurriness * multiplier;
          efft.uniforms.dir.value.set(effect.direction[0], effect.direction[1]);
          if(effect.timeline.blurriness !== undefined) {
            THREELayer.animate(efft.uniforms.radius, 'value', this.timeline, effect.timeline.blurriness, multiplier);
          }
        }
        
        if(efft !== undefined) {
          this.post.add(efft);
        }
      });
    }
    
    buildLayerComposition(json) {
      let cJSON = TimelineConfig.json.project.compositions[json.name];
      let atlas = TimelineConfig.json.atlas.compositions[json.name];
      let layer = new THREEComposition(json, this.renderer);
      layer.build(cJSON, this);
      layer.buildAtlas(atlas);
      layer.applyEffects(json.effects);
      if(json.matte !== undefined) {
        let src = TimelineConfig.fileID(json.matte.src);
        let mask = TimelineConfig.textures[src];
        let effect = new TrackMattePass({
          matte: mask
        });
        layer.post.add(effect);
        layer.post.enabled = true;
      }
      layer.setupEffects();
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