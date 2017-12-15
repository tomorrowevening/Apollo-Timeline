var PIXI = require('pixi.js');
import PIXILayer from './PIXILayer';
import TimelineConfig from '../TimelineConfig';

export default class PIXIImage extends PIXILayer {
  constructor(json, timeline) {
    super(json, timeline);
    var src     = json.content.source;
    var imgID   = TimelineConfig.fileID( src );
    var img     = TimelineConfig.images[imgID];
    
    console.log(imgID, img.width, img.height);
    
    let baseTex = TimelineConfig.textures[imgID];
    
    var texture = new PIXI.Texture(
      baseTex,
      new PIXI.Rectangle(0, 0, img.width, img.height),
      new PIXI.Rectangle(0, 0, img.width, img.height)
    );
    
    var spr = new PIXI.Sprite( texture );
    // var spr = new PIXI.Sprite.fromImage(src);
    this.item.addChild( spr );
    window.spr = spr;
    
    // var texture = new PIXI.Texture( baseTex );
    // // baseTex.once('loaded', (text) => {
    //   console.log(img.width, img.height);
    //   console.log(baseTex.hasLoaded, baseTex.isLoading);
      
    //   // texture.setFrame(new PIXI.Rectangle(0, 0, json.content.width, json.content.height));
    //   var spr = new PIXI.Sprite( texture );
    //   console.log(json);
    //   console.log(src);
    //   console.log(spr);
    //   // var spr     = new PIXI.Sprite( new PIXI.Texture( new PIXI.BaseTexture(img) ) );
    //   this.item.addChild( spr );
    //   window.spr = spr;
    // // })
  }
}