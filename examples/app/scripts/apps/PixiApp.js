var PIXI = require('pixi.js');
import Debug from 'apollo-utils/Debug';
import { delay } from 'apollo-utils/DOMUtil';
import BaseApp from './BaseApp';
import { canvas } from '../models/global';
import { pixiApp, renderer } from '../models/pixi';
import TimelineConfig from '../../../../src/TimelineConfig';
import PIXIComposition from '../../../../src/pixi/PIXIComposition';

export default class PixiApp extends BaseApp {
  constructor() {
    super({
      apps: [
        'images',
        'shapes',
        'text',
        'video'
      ]
    });
    PIXI.ticker.shared.add( this.updateHandler.bind(this) );
  }
  
  setup() {
    super.setup();
    
    // Images/Textures
    for(let i in TimelineConfig.images) {
      let tex = new PIXI.BaseTexture(TimelineConfig.images[i]);
      tex._sourceLoaded();
      TimelineConfig.textures[i] = tex;
    }
    
    for(let v in TimelineConfig.video) {
      let video = TimelineConfig.video[v];
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('crossorigin', '');
      
      let texture = PIXI.Texture.fromVideo(TimelineConfig.files[v]);
      texture.baseTexture.autoPlay = false;
      TimelineConfig.textures[v] = texture;
    }
  }
  
  dispose() {
    super.dispose();
    pixiApp.destroy();
  }
  
  resize(evt) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = window.devicePixelRatio;
    renderer.resize(w * s, h * s);
    canvas.style.width  = w.toString() + 'px';
    canvas.style.height = h.toString() + 'px';
  }
  
  play() {
    pixiApp.start();
  }
  
  // Animation
  showComp(name) {
    super.showComp(name);
    
    const mainJSON  = TimelineConfig.json.project.compositions[name];
    const atlasJSON = TimelineConfig.json.atlas.compositions[name];
    this.comp = new PIXIComposition(mainJSON, renderer);
    pixiApp.stage.addChild(this.comp.item);
    this.comp.build(mainJSON);
    this.comp.buildAtlas(atlasJSON);
    this.comp.play();
    
    let texture = PIXI.Texture.fromImage('images/gradient.png');
    let sprite1 = new PIXI.Sprite(texture);
    pixiApp.stage.addChild(sprite1);
  }
}
