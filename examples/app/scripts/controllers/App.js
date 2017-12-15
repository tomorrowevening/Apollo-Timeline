var THREE = require('THREE');
import Debug from 'apollo-utils/Debug';
import AppRunner from 'apollo-utils/AppRunner';
import { delay } from 'apollo-utils/DOMUtil';
import Loader from 'apollo-utils/Loader';
import { canvas, renderer } from '../models/global';
// Timeline
require('../../../../../src/three/EffectComposer')(THREE);
// Scene
import LoadBar from '../views/LoadBar';
import TimelineConfig from '../../../../../src/TimelineConfig';
var THREEComposition = require('../../../../../src/three/THREEComposition')(THREE);

// Loading
let loadBar, loadComplete, loading = true;
// Animation
let comp;

export default class App extends AppRunner {
  constructor() {
    super();
    
    Debug.init();
    loadComplete = this.loadComplete.bind(this);
  }
  
  setup() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 1, 25000);
    this.camera.position.set(0, 0, 1000);
  }
  
  dispose() {
    this.scene.dispose();
  }
  
  update() {
    if(!loading) {
      comp.update();
    }
  }
  
  draw() {
    Debug.begin();
    
    renderer.clear();
    if(!loading) {
      comp.draw();
    } else {
      renderer.render(this.scene, this.camera);
    }
    
    Debug.end();
  }
  
  resize(evt) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    
    if(!loading) {
      comp.resize(w, h);
    }
  }
  
  //////////////////////////////////////////////////
  // App Core
  
  // Loading
  
  beginLoad() {
    loadBar = new LoadBar();
    this.scene.add(loadBar);
    loadBar.addEventListener(LoadBar.COMPLETE, loadComplete);
    loadBar.startLoad();
  }
  
  loadComplete(evt) {
    loadBar.removeEventListener(LoadBar.COMPLETE, loadComplete);
    
    delay(0.5, () => {
      this.copyToConfig();
      console.log('load complete!', TimelineConfig);
      this.init();
    });
  }
  
  init() {
    let apps = {
      combo: () => { this.showComp('combo'); },
      shapes: () => { this.showComp('shapes'); },
      text: () => { this.showComp('text'); },
      video: () => { this.showComp('video'); },
      maskAnimation: () => { this.showComp('maskAnimation'); }
    };
    let folder = Debug.gui.addFolder('Apps');
    folder.add(apps, 'combo');
    folder.add(apps, 'shapes');
    folder.add(apps, 'text');
    folder.add(apps, 'video');
    folder.add(apps, 'maskAnimation');
    folder.open();
    
    this.showComp('shapes');
    // this.showComp('maskAnimation');
    
    // Clear loader
    loadBar.dispose();
    loading = false;
  }
  
  // Copy files to TimelineConfig
  
  copyToConfig() {
    // JSON
    for(let i in Loader.json) {
      TimelineConfig.json[i] = Loader.json[i];
    }
    
    // Images/Textures
    for(let i in Loader.images) {
      TimelineConfig.images[i] = Loader.images[i];
      
      let tex = new THREE.Texture(Loader.images[i]);
      tex.needsUpdate = true;
      TimelineConfig.textures[i] = tex;
    }
    
    // Video
    for(let i in Loader.video) {
      TimelineConfig.video[i] = Loader.video[i];
    }
  }
  
  // Animation
  showComp(name) {
    if(comp !== undefined) {
      comp.dispose();
      comp = undefined;
    }
    
    const mainJSON  = TimelineConfig.json.project.compositions[name];
    const atlasJSON = TimelineConfig.json.atlas.compositions[name];
    comp = new THREEComposition(mainJSON, renderer);
    comp.build(mainJSON);
    comp.buildAtlas(atlasJSON);
    comp.play();
  }
}
