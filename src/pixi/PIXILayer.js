var PIXI = require('pixi.js');
import { toRad } from 'apollo-utils/MathUtil';
import Keyframe from '../Keyframe';
import ArrayKeyframe from '../ArrayKeyframe';
import Layer from '../Layer';

export default class PIXILayer extends Layer {
  constructor(json, timeline) {
    super(json);

    this.item = new PIXI.Container();
    this.name = json.name;

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
    }

    PIXILayer.transform(this.item, json.transform, timeline);
    PIXILayer.createMasks(this.item, json.masks, timeline);
  }
  
  //////////////////////////////////////////////////
  // Static

  static createMasks(layer, masks, timeline) {
    if(masks === undefined || masks.length === 0) return;

    var scale = window.devicePixelRatio,
      offX = layer.pivot.x,
      offY = layer.pivot.y;

    var mask = new PIXI.Graphics();
    mask.beginFill(0xffffff, 1);
    var i, total = masks.length;
    for(i = 0; i < total; ++i) {
      var content = masks[i];
      var n, t, nTotal = content.vertices.length;
      mask.moveTo((content.vertices[0][0] - offX) * scale, (content.vertices[0][1] - offY) * scale)
      for(n = 0; n < nTotal; ++n) {
        t = (n + 1) % nTotal;
        mask.bezierCurveTo(
          (content.vertices[n][0] + content.outTangents[n][0] - offX) * scale,
          (content.vertices[n][1] + content.outTangents[n][1] - offY) * scale,
          (content.vertices[t][0] + content.inTangents[t][0] - offX) * scale,
          (content.vertices[t][1] + content.inTangents[t][1] - offY) * scale,
          (content.vertices[t][0] - offX) * scale,
          (content.vertices[t][1] - offY) * scale
        );
      }

      PIXILayer.morph(mask, content, timeline, true);
    }
    layer.addChild(mask);
    layer.mask = mask;
    return mask;
  }

  static morph(layer, path, timeline, closed) {
    if(path.timeline === undefined) return;

    var lStyle = {
      alpha: layer.lineAlpha,
      color: layer.lineColor,
      width: layer.lineWidth
    };
    var fStyle = {
      alpha: layer.fillAlpha,
      color: layer.fillColor
    };

    var scale = window.devicePixelRatio;
    var i, n, s, t, total, nTotal, x0, y0, x1, y1, x, y;
    total = path.timeline.length;
    for(i = 0; i < total; ++i) {
      var ani = path.timeline[i];
      nTotal = ani.keys.length;

      for(n = 0; n < nTotal; ++n) {
        var key = ani.keys[n];
        var delay = key.start;
        var duration = key.duration;
        var ease = [key.x0, key.y0, key.x1, key.y1];
        const data = {
          index: n,
          value: 0,
          total: key.verticesValue.length,
          vertsValue: key.verticesValue,
          vertsTarget: key.verticesTarget,
          tanInValue: key.inTangentsValue,
          tanInTarget: key.inTangentsTarget,
          tanOutValue: key.outTangentsValue,
          tanOutTarget: key.outTangentsTarget
        };
        var keyframe = new Keyframe(data, 'value', 1, duration, delay, ease, undefined, function(percent, curved) {
          layer.clear();
          if(lStyle.width > 0) layer.lineStyle(lStyle.width, lStyle.color, lStyle.alpha);
          if(fStyle.color !== undefined) layer.beginFill(fStyle.color, fStyle.alpha);

          layer.moveTo(
            lerp(curved, data.vertsValue[0][0], data.vertsTarget[0][0]) * scale,
            lerp(curved, data.vertsValue[0][1], data.vertsTarget[0][1]) * scale
          );

          for(s = 0; s < data.total; ++s) {
            t = s + 1;
            if(closed) t = t % data.total;
            else if(t >= data.total) break;

            x0 = lerp(curved,
              data.vertsValue[s][0] + data.tanOutValue[s][0],
              data.vertsTarget[s][0] + data.tanOutTarget[s][0]
            ) * scale;
            y0 = lerp(curved,
              data.vertsValue[s][1] + data.tanOutValue[s][1],
              data.vertsTarget[s][1] + data.tanOutTarget[s][1]
            ) * scale;

            x1 = lerp(curved,
              data.vertsValue[t][0] + data.tanInValue[t][0],
              data.vertsTarget[t][0] + data.tanInTarget[t][0]
            ) * scale;
            y1 = lerp(curved,
              data.vertsValue[t][1] + data.tanInValue[t][1],
              data.vertsTarget[t][1] + data.tanInTarget[t][1]
            ) * scale;

            x = lerp(curved,
              data.vertsValue[t][0],
              data.vertsTarget[t][0]
            ) * scale;
            y = lerp(curved,
              data.vertsValue[t][1],
              data.vertsTarget[t][1]
            ) * scale;

            layer.bezierCurveTo(x0, y0, x1, y1, x, y);
          }
        });

        keyframe.easeType = key.type;
        timeline.addKeyframe(keyframe);
      }
    }
  }

  static transform(layer, transform, timeline) {
    if(transform.timeline === undefined) return;

    var scale = window.devicePixelRatio;
    var i, n, total, nTotal;
    total = transform.timeline.length;
    for(i = 0; i < total; ++i) {
      var ani = transform.timeline[i];
      nTotal = ani.keys.length;

      for(n = 0; n < nTotal; ++n) {
        var key      = ani.keys[n];
        var from     = key.value;
        var target   = key.target;
        var delay    = key.start;
        var duration = key.duration;
        var x0       = key.x0;
        var y0       = key.y0;
        var x1       = key.x1;
        var y1       = key.y1;
        var ease     = [x0, y0, x1, y1];
        var keyframe   = undefined;

        switch(ani.name) {
          case 'opacity':
            keyframe = new Keyframe( layer, 'alpha', target, duration, {
              delay: delay,
              ease: ease,
              from: from
            } );
          break;
          
          case 'positionX':
            keyframe = new Keyframe( layer, 'x', target*scale, duration, {
              delay: delay,
              ease: ease,
              from: from*scale
            } );
          break;
          case 'positionY':
            keyframe = new Keyframe( layer, 'y', target*scale, duration, {
              delay: delay,
              ease: ease,
              from: from*scale
            } );
          break;
          
          case 'rotationZ':
            keyframe = new Keyframe( layer, 'rotation', toRad(target), duration, {
              delay: delay,
              ease: ease,
              from: toRad(from)
            } );
          break;
          
          case 'scaleX':
            keyframe = new Keyframe( layer.scale, 'x', target, duration, {
              delay: delay,
              ease: ease,
              from: from
            } );
          break;
          case 'scaleY':
            keyframe = new Keyframe( layer.scale, 'y', target, duration, {
              delay: delay,
              ease: ease,
              from: from
            } );
          break;
        }

        if(keyframe !== undefined) {
          keyframe.easeType = key.type;
          timeline.addKeyframe(keyframe);
        }
      }
    }
  }
}