import { curveAt } from './Bezier';
import MathUtil from 'apollo-utils/MathUtil';

export const KeyframeType = {
  LINEAR: 'linear',
  BEZIER: 'bezier',
  HOLD: 'hold'
};

export class Keyframe {
  
  constructor(object, key, endValue, duration, params) {
    params = params !== undefined ? params : {};

    this.active     = false;
    this.object     = object;
    this.key        = key;
    this.endValue   = endValue;
    this.duration   = duration;
    this.timestamp  = params.delay !== undefined ? params.delay : 0;
    this.ease       = params.ease !== undefined ? params.ease : [0.25, 0.25, 0.75, 0.75];
    this.startValue = params.start;
    this.onComplete = params.onComplete;
    this.onUpdate   = params.onUpdate;
    this.easeType   = KeyframeType.BEZIER;

    if(this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3]) {
      this.easeType = KeyframeType.LINEAR;
    }
  }
  
  update(progress) {
    let percent = progress; // KeyframeType.LINEAR

    if(this.easeType === KeyframeType.BEZIER) {
      percent = curveAt(percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3]);
    } else if(this.easeType === KeyframeType.HOLD) {
      percent = progress < 1 ? 0 : 1;
    }

    if(!this.active && this.startValue === undefined) {
      this.startValue = this.object[this.key];
    }

    this.object[this.key] = MathUtil.lerp(percent, this.startValue, this.endValue);

    if(this.onUpdate !== undefined) {
      this.onUpdate(progress, percent);
    }
  }
  
  complete() {
    this.update(1);

    if(this.onComplete !== undefined) this.onComplete();
    this.active = false;
  }
  
  isActive(time) {
    return time >= this.startTime && time <= this.endTime;
  }

  // Getters

  get startTime() {
    return this.timestamp;
  }

  get endTime() {
    return this.timestamp + this.duration;
  }
  
}
