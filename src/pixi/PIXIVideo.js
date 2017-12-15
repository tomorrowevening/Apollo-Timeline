var PIXI = require('pixi.js');
import { delay } from 'apollo-utils/DOMUtil';
import PIXILayer from './PIXILayer';
import TimelineConfig from '../TimelineConfig';

export default class PIXIVideo extends PIXILayer {
  constructor(json, timeline) {
    super(json, timeline);
    
    let videoID = TimelineConfig.fileID(json.content.source);
    this.texture = TimelineConfig.textures[videoID];
    
    let spr  = new PIXI.Sprite(this.texture);
    spr.width  = json.content.width;
    spr.height = json.content.height;
    
    // var graphics = new PIXI.Graphics();
    // graphics.lineStyle(2, 0x0000FF, 1);
    // graphics.beginFill(0xFF700B, 1);
    // graphics.drawRect(50, 250, 120, 120);
    // this.item.addChild( graphics );
    
    delay(1, () => {
      this.item.addChild( spr );
      
      this.texture.baseTexture.source.currentTime = 0;
      this.texture.baseTexture.source.muted = true;
      this.texture.baseTexture.source.play();
    })
  }
  
  update(time, duration) {
    // console.log(time, duration);
    // this.texture.baseTexture.source.currentTime = time;
  }
}