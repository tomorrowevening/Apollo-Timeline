var PIXI = require('pixi.js');
import { toRad } from 'apollo-utils/MathUtil';
import TimelineConfig from '../TimelineConfig';
import Composition from '../Composition';
import PIXILayer from './PIXILayer';
import PIXIImage from './PIXIImage';
import PIXIShape from './PIXIShape';
import PIXIText from './PIXIText';
import PIXIVideo from './PIXIVideo';

export default class PIXIComposition extends Composition {
  constructor(json, renderer) {
    super(json);
    
    this.renderer = renderer;
    this.item = new PIXI.Container();

    if(json.transform !== undefined) {
      var scale = window.devicePixelRatio;
      this.item.alpha = json.transform.opacity;
      this.item.pivot.x = json.transform.anchor[0] * scale;
      this.item.pivot.y = json.transform.anchor[1] * scale;
      this.item.position.x = json.transform.position[0] * scale;
      this.item.position.y = json.transform.position[1] * scale;
      this.item.rotation = toRad(json.transform.rotation[2]);
      this.item.scale.x = json.transform.scale[0];
      this.item.scale.y = json.transform.scale[1];
      
      PIXILayer.transform(this.item, json.transform, this.timeline);
      PIXILayer.createMasks(this.item, json.masks, this.timeline);
    }
  }
  
  dispose() {
    if(this.item.parent !== undefined) {
      this.item.parent.removeChild(this.item);
      delete this.item;
    }
    this.timeline.dispose();
    this.camera = undefined;
    this.layers = [];
  }
  
  updateLayers(time, duration) {
    // console.log(time, duration);
    // var time = this.timeline.seconds;
    var total = this.layers.length;
    for(var i = 0; i < total; ++i) {
      var l = this.layers[i];
      var s = l.showable(time);
      l.item.visible = s;
      if(s) {
        var t = time - l.start;
        if(l instanceof Composition && !l.showing) {
          l.show();
        }
        l.update(t, duration);
      } else if(l.showing) {
        l.showing = false;
        if(l instanceof Composition) {
          l.hide();
        }
      }
    }
  }
  
  //////////////////////////////////////////////////
  // Building
  
  buildLayerComposition(json) {
    let cJSON = TimelineConfig.json.project.compositions[json.name];
    let atlas = TimelineConfig.json.atlas.compositions[json.name];
    let layer = new PIXIComposition(json, this.renderer);
    layer.build(cJSON, this);
    layer.buildAtlas(atlas);
    this.item.addChild(layer.item);
    return layer;
  }
  
  buildLayerImage(json) {
    let layer = new PIXIImage(json, this.timeline);
    this.item.addChild(layer.item);
    return layer;
  }
  
  buildLayerShape(json) {
    let layer = new PIXIShape(json, this.timeline);
    this.item.addChild(layer.item);
    return layer;
  }
  
  buildLayerText(json) {
    let layer = new PIXIText(json, this.timeline);
    this.item.addChild(layer.item);
    return layer;
  }
  
  buildLayerVideo(json) {
    let layer = new PIXIVideo(json, this.timeline);
    this.item.addChild(layer.item);
    return layer;
  }
}
