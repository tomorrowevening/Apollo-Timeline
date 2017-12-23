var THREE = require('THREE');
import Debug from 'apollo-utils/Debug';
import Loader from 'apollo-utils/Loader';
import BaseApp from './BaseApp';
// Timeline
import TimelineConfig from '../../../../src/TimelineConfig';
var THREEComposition = require('../../../../src/three/THREEComposition')(THREE);
import { renderer, hud } from '../models/three';

let pass;

export default class ThreeApp extends BaseApp {
  constructor() {
    super({
      apps: [
        'images',
        'shapes',
        'text',
        'video',
        'maskAnimation',
        'masked',
        'compMasking',
        'imgMasking',
        'multiCompMasking',
        'textMasking'
      ]
    });
  }
  
  setup() {
    super.setup();
    
    this.appFolder.add(hud, 'show').name('Show HUD');
    this.appFolder.add(hud, 'hide').name('Hide HUD');
    
    // Images/Textures
    for(let i in TimelineConfig.images) {
      let tex = new THREE.Texture(TimelineConfig.images[i]);
      tex.needsUpdate = true;
      TimelineConfig.textures[i] = tex;
    }
  }
  
  draw() {
    renderer.clear();
    super.draw();
    hud.draw();
  }
  
  resize(evt) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    hud.resize(w, h);
    super.resize();
  }
  
  // Animation
  showComp(name) {
    super.showComp(name);
    
    const mainJSON  = TimelineConfig.json.project.compositions[name];
    const atlasJSON = TimelineConfig.json.atlas.compositions[name];
    this.comp = new THREEComposition(mainJSON, renderer);
    this.comp.build(mainJSON);
    this.comp.buildAtlas(atlasJSON);
    this.comp.play();
    window.comp = this.comp;
  }
}
