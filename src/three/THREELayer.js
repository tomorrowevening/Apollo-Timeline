import { toRad } from 'apollo-utils/MathUtil';
import Keyframe from '../Keyframe';
import ArrayKeyframe from '../ArrayKeyframe';
import Layer from '../Layer';

module.exports = function(THREE) {
  class THREELayer extends Layer {
    constructor(json, timeline) {
      super(json);
      this.item = new THREE.Object3D();
      this.item.name = 'item';
      this.mesh = undefined; // add to this.item
    }

    //////////////////////////////////////////////////
    // Static

    /**
     * Adds keyframes to the object
     * @param  {Object} object      [description]
     * @param  {String} key         [description]
     * @param  {Timeline instance} timeline    [description]
     * @param  {JSON} animation [description]
     * @param  {Boolean} deviceRatio [description]
     */
    static animate(object, key, timeline, animation, deviceRatio, opt) {
      if(opt === undefined) opt = {};
      const scale = deviceRatio !== undefined ? deviceRatio : 1;
      let i, keyframe, total = animation.keys.length;
      for(i = 0; i < total; ++i) {
        const frame = animation.keys[i];
        const from = frame.value;
        const isArr = Array.isArray(from);
        const isStr = (typeof from) === 'string';
        const noScale = isArr || isStr;
        const target = noScale ? frame.target : frame.target * scale;
        const delay = frame.start;
        const duration = frame.duration;
        let params = {
          ease: [frame.x0, frame.y0, frame.x1, frame.y1],
          start: noScale ? from : from * scale,
          delay: delay,
          onUpdate: opt.onUpdate,
          onComplete: opt.onComplete
        };
        
        if(isArr) {
          keyframe = new ArrayKeyframe(object, key, target, duration, params);
        } else {
          keyframe = new Keyframe(object, key, target, duration, params);
        }
        keyframe.easeType = frame.type;
        timeline.addKeyframe(keyframe);
      }
    }

    static transform(container, mesh, transform, timeline) {
      const scale = window.devicePixelRatio;
      const t = transform;
      const a = (t.anchor.length > 2) ? t.anchor : [t.anchor[0], t.anchor[1], 0];
      const p = (t.position.length > 2) ? t.position : [t.position[0], t.position[1], 0];
      const r = (t.rotation.length > 2) ? t.rotation : [t.rotation[0], t.rotation[1], 0];
      const s = (t.scale.length > 2) ? t.scale : [t.scale[0], t.scale[1], 1];

      container.position.set(p[0] * scale, -p[1] * scale, p[2] * scale);
      container.scale.set(s[0], s[1], s[2]);
      container.rotation.set(toRad(r[0]), toRad(r[1]), -toRad(r[2]));
      if(mesh !== undefined) {
        mesh.position.set(-a[0] * scale, a[1] * scale, a[2] * scale); // anchor
        if(mesh.material !== undefined) mesh.material.opacity = t.opacity;
      }

      if(t.timeline === undefined) return;

      let i, n, total, nTotal;
      total = t.timeline.length;
      for(i = 0; i < total; ++i) {
        let ani = t.timeline[i];
        nTotal = ani.keys.length;

        for(n = 0; n < nTotal; ++n) {
          const key = ani.keys[n];
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
          };
          let keyframe = undefined;

          switch(ani.name) {
            case 'opacity':
              if(mesh !== undefined && mesh.material !== undefined) {
                keyframe = new Keyframe(mesh.material, 'opacity', target, duration, params);
              }
              break;

            case 'anchorX':
              if(mesh !== undefined) {
                params.start *= -scale;
                keyframe = new Keyframe(mesh.position, 'x', -target * scale, duration, params);
              }
              break;
            case 'anchorY':
              if(mesh !== undefined) {
                params.start *= scale;
                keyframe = new Keyframe(mesh.position, 'y', target * scale, duration, params);
              }
              break;

            case 'positionX':
              params.start *= scale;
              keyframe = new Keyframe(container.position, 'x', target * scale, duration, params);
              break;
            case 'positionY':
              params.start *= -scale;
              keyframe = new Keyframe(container.position, 'y', -target * scale, duration, params);
              break;
            case 'positionZ':
              params.start *= scale;
              keyframe = new Keyframe(container.position, 'z', target * scale, duration, params);
              break;

            case 'rotationX':
              params.start = toRad(params.start);
              keyframe = new Keyframe(container.rotation, 'x', toRad(target), duration, params);
              break;
            case 'rotationY':
              params.start = -toRad(params.start);
              keyframe = new Keyframe(container.rotation, 'y', -toRad(target), duration, params);
              break;
            case 'rotationZ':
              params.start = -toRad(params.start);
              keyframe = new Keyframe(container.rotation, 'z', -toRad(target), duration, params);
              break;

            case 'scaleX':
              keyframe = new Keyframe(container.scale, 'x', target, duration, params);
              break;
            case 'scaleY':
              keyframe = new Keyframe(container.scale, 'y', target, duration, params);
              break;
            case 'scaleZ':
              keyframe = new Keyframe(container.scale, 'z', target, duration, params);
              break;
          }

          if(keyframe !== undefined) {
            keyframe.easeType = key.type;
            timeline.addKeyframe(keyframe);
          }
        }
      }
    }

    static morph(layer, path, timeline, closed) {}
  }

  return THREELayer;
}
