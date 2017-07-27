import { lerp } from 'apollo-utils/MathUtil';
import Keyframe from '../Keyframe';

export function SVGAnimate(element, animations, timeline) {
  let i, n, nTotal, total = animations.length;
  for(i = 0; i < total; ++i) {
    let ani = animations[i];
    nTotal  = ani.keys.length;
    
    for(n = 0; n < nTotal; ++n) {
      let key      = ani.keys[n];
      let target   = key.target;
      let duration = key.duration;
      let x0       = key.x0;
      let y0       = key.y0;
      let x1       = key.x1;
      let y1       = key.y1;
      let keyframe = undefined;
      let params = {
        ease: [x0, y0, x1, y1],
        start: key.value,
        delay: key.start
      };
      
      switch(ani.name) {
        case 'dash':
          keyframe = new Keyframe( element, 'strokeDash', target, duration, params );
        break;
        case 'gap':
          keyframe = new Keyframe( element, 'strokeGap', target, duration, params );
        break;
        case 'offset':
          keyframe = new Keyframe( element, 'strokeOffset', target, duration, params );
        break;
        case 'width':
          keyframe = new Keyframe( element, 'strokeWidth', target, duration, params );
        break;
      }
      
      if(keyframe !== undefined) {
        keyframe.easeType = key.type;
        timeline.addKeyframe( keyframe );
      }
    }
  }
}

export function SVGMorph(element, animations, style, timeline) {
  const me = this;
  var i, total, n, nTotal;
  total = animations.length;
  for (i = 0; i < total; ++i) {
    var ani = animations[i];
    nTotal = ani.keys.length;
    for (n = 0; n < nTotal; ++n) {
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
      var keyframe = new Keyframe(data, 'value', 1, duration, delay, ease, undefined, undefined, function(percent, curved) {
        var params = {
          vertices: [],
          inTangents: [],
          outTangents: [],
        };
        for (let s = 0; s < data.total; ++s) {
          let t = s + 1;
          if (closed) t = t % data.total;
          else if (t >= data.total) break;

          params.vertices.push([
            lerp(curved, data.vertsValue[t][0], data.vertsTarget[t][0]),
            lerp(curved, data.vertsValue[t][1], data.vertsTarget[t][1])
          ]);

          params.inTangents.push([
            lerp(curved, data.tanInValue[t][0], data.tanInTarget[t][0]),
            lerp(curved, data.tanInValue[t][1], data.tanInTarget[t][1])
          ]);

          params.outTangents.push([
            lerp(curved, data.tanOutValue[t][0], data.tanOutTarget[t][0]),
            lerp(curved, data.tanOutValue[t][1], data.tanOutTarget[t][1])
          ]);
        }
        var border = me.getMaxBorder(style);
        var svgPath = me.bezierToPath(params, undefined, border, border);
        element.setAttribute('d', svgPath);
        me.determineBounds(element, params, border);
      });

      keyframe.easeType = key.type;
      timeline.addKeyframe(keyframe);
    }
  }
}
