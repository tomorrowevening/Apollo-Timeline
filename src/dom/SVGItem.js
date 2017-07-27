import { CSSExtend } from 'apollo-utils/CSSUtil';
import {
  SVGCreate,
  SVGEllipse,
  SVGRectangle,
  SVGShape,
  createMasks,
  applyMasks,
  getMaxBorder
} from './SVGUtil';
import Keyframe from '../Keyframe';

export default class SVGItem {
  constructor(json, timeline) {
    this.item = SVGCreate();
    CSSExtend(this.item);

    // Default
    this.item.title = json.name;
    let masks = createMasks(this.item, json);
    if(json.transform !== undefined) {
      transform(this.item, json.transform, timeline);
    }

    let width = 0;
    let height = 0;

    const total = json.content.length;
    for(let i = 0; i < total; ++i) {
      let layer = json.content[i];
      let n, nTotal;
      if(layer.type === 'shape') {
        let style = styleOptions(this.item, layer.content, timeline);
        let border = getMaxBorder(style);

        nTotal = layer.paths.length;
        for(n = 0; n < nTotal; ++n) {
          let p = layer.paths[n];
          let svg = undefined;
          switch(p.type) {
            case 'rectangle':
              svg = SVGRectangle(p, style, this.item, timeline);
              break;
            case 'ellipse':
              svg = SVGEllipse(p, style, this.item, timeline);
              this.item.x -= border / 2;
              this.item.y -= border / 2;
              break;
            case 'polygon':
              break;
            case 'polystar':
              break;
            case 'shape':
              svg = SVGShape(p, style, this.item, timeline);
              this.item.x -= border / 2;
              this.item.y -= border / 2;
              break;
          }

          if(svg !== undefined) {
            this.item.x -= border / 2;
            this.item.y -= border / 2;
            applyMasks(svg, masks);
            this.item.appendChild(svg);
          }
        }

        nTotal = layer.content.length;
        for(n = 0; n < nTotal; ++n) {
          let p = layer.content[n];
          if(p.type === 'trim') {
            applyTrimPath(this.item.children[0], p, timeline);
          }
        }
      } else if(layer.type === 'trim') {
        nTotal = this.item.children.length;
        for(n = 0; n < nTotal; ++n) {
          let kid = this.item.children[n];
          if(kid.tagName === 'path') {
            applyTrimPath(kid, layer, timeline);
          }
        }
      }
    }
  }

  static transform(element, transform, timeline) {
    const a = transform.anchor;
    const p = transform.position;
    const r = transform.rotation;
    const s = transform.scale;
    const originX = (a[0] / element.width) * 100;
    const originY = (a[1] / element.height) * 100;

    // Default
    element.style.position = 'absolute';

    element.x = p[0];
    element.y = p[1];
    element.rotateX = r[0];
    element.rotateY = r[1];
    element.rotateZ = r[2];
    element.scaleX = s[0];
    element.scaleY = s[1];
    element.originX = originX;
    element.originY = originY;
    element.translateX = -a[0];
    element.translateY = -a[1];
    element.translateZ = p.length > 2 ? p[2] : 0;
    element.opacity = transform.opacity;

    if(transform.timeline === undefined) return;

    let i, n, nTotal, total = transform.timeline.length;
    for(i = 0; i < total; ++i) {
      let ani = transform.timeline[i];
      nTotal = ani.keys.length;

      for(n = 0; n < nTotal; ++n) {
        const key = ani.keys[n];
        const target = key.target;
        const duration = key.duration;
        const x0 = key.x0;
        const y0 = key.y0;
        const x1 = key.x1;
        const y1 = key.y1;
        let keyframe = undefined;
        let params = {
          ease: [x0, y0, x1, y1],
          start: key.value,
          delay: key.start
        };

        switch(ani.name) {
          case 'opacity':
            keyframe = new Keyframe(element, 'opacity', target, duration, params);
            break;

          case 'positionX':
            keyframe = new Keyframe(element, 'x', target, duration, params);
            break;
          case 'positionY':
            keyframe = new Keyframe(element, 'y', target, duration, params);
            break;
          case 'positionZ':
            keyframe = new Keyframe(element, 'translateZ', target, duration, params);
            break;

          case 'rotationX':
            params.start *= -1;
            keyframe = new Keyframe(element, 'rotateX', -target, duration, params);
            break;
          case 'rotationY':
            params.start *= -1;
            keyframe = new Keyframe(element, 'rotateY', -target, duration, params);
            break;
          case 'rotationZ':
            keyframe = new Keyframe(element, 'rotateZ', target, duration, params);
            break;

          case 'scaleX':
            keyframe = new Keyframe(element, 'scaleX', target, duration, params);
            break;
          case 'scaleY':
            keyframe = new Keyframe(element, 'scaleY', target, duration, params);
            break;
          case 'scaleZ':
            keyframe = new Keyframe(element, 'scaleZ', target, duration, params);
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

function styleOptions(element, content, timeline) {
  let obj = {
    'fill': 'none',
    'fillAlpha': 1,
    'stroke': undefined,
    'strokeAlpha': 1,
    'strokeCap': 'butt',
    'strokeCorner': 'miter',
    'strokeDashes': undefined,
    'strokeWidth': undefined,
    'transform': undefined,
    'timeline': []
  };

  let i, total = content.length;
  for(i = 0; i < total; ++i) {
    let n = content[i];

    if(n.type === 'fill') {
      let r = Math.round(n.value.color[0] * 255).toString();
      let g = Math.round(n.value.color[1] * 255).toString();
      let b = Math.round(n.value.color[2] * 255).toString();
      let a = n.value.opacity;
      obj.fill = 'rgb(' + r + ', ' + g + ', ' + b + ')';
      obj.fillAlpha = a;
      if(n.timeline.length > 0) {
        obj.timeline = obj.timeline.concat(n.timeline);
      }
    } else if(n.type === 'stroke') {
      let r = Math.round(n.value.color[0] * 255).toString();
      let g = Math.round(n.value.color[1] * 255).toString();
      let b = Math.round(n.value.color[2] * 255).toString();
      obj.stroke = 'rgb(' + r + ', ' + g + ', ' + b + ')';
      obj.strokeAlpha = n.value.opacity;
      obj.strokeCap = n.value.cap;
      obj.strokeCorner = n.value.corner;
      obj.strokeDashes = n.value.dashes;
      obj.strokeWidth = n.value.width;
      if(n.timeline.length > 0) {
        obj.timeline = obj.timeline.concat(n.timeline);
      }
    } else if(n.type === 'transform') {
      obj.transform = n;
    } else if(n.type === 'trim') {
      let kTotal = element.children.length;
      for(let k = 0; k < kTotal; ++k) {
        let kid = element.children[k];
        if(kid.tagName === 'path') {
          applyTrimPath(kid, n, timeline);
        }
      }
    }
  }

  return obj;
}

function applyTrimPath(element, json, timeline) {
  element._startPercent = json.value.start;
  element._endPercent = json.value.end;
  element._offsetPercent = json.value.offset;
  element.updatePath();

  let map = {
    'start': 'startPercent',
    'end': 'endPercent',
    'offset': 'offsetPercent'
  };

  let i, total = json.timeline.length - 1;
  for(i = total; i > -1; --i) {
    let type = json.timeline[i];
    let param = map[type.name];
    if(param !== undefined) {
      let n, nTotal = type.keys.length;
      for(n = 0; n < nTotal; ++n) {
        let key = type.keys[n];
        const target = key.target;
        const duration = key.duration;
        const x0 = key.x0;
        const y0 = key.y0;
        const x1 = key.x1;
        const y1 = key.y1;
        let params = {
          ease: [x0, y0, x1, y1],
          start: key.value,
          delay: key.start
        }

        let keyframe = new Keyframe(element, param, target, duration, params);
        keyframe.easeType = key.type;
        timeline.addKeyframe(keyframe);
      }
    }
  }
}
