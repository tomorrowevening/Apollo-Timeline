var PIXI = require('pixi.js');
import { getHex } from 'apollo-utils/DOMUtil';
import PIXILayer from './PIXILayer';

export default class PIXIText extends PIXILayer {
  constructor(json, timeline) {
    super(json, timeline);
    console.log(json);
    var fName = json.content.font;
    var fSize = json.content.fontSize * window.devicePixelRatio;
    var offY  = -Math.round(fSize * 0.725);
    var style = {
      fontFamily: fName,
      fontSize  : fSize,
      fill      : getHex(json.content.color[0], json.content.color[1], json.content.color[2]),
      align     : json.content.align
    };
    
    this.pText = new PIXI.Text( json.content.text );
    this.pText.position.y = offY;
    this.item.addChild( this.pText );
  }
}