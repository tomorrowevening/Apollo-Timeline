import { lerp, curveAt } from 'apollo-utils/MathUtil';

export default class Keyframe {
  static LINEAR = 'linear';
  static BEZIER = 'bezier';
  static HOLD = 'hold';
  
  constructor(object, key, endValue, duration, params) {
    params = params !== undefined ? params : {};

    this.active = false;
    this.object = object;
    this.key = key;
    this.endValue = endValue;
    this.duration = duration;
    this.timestamp = params.delay !== undefined ? params.delay : 0;
    this.ease = params.ease !== undefined ? params.ease : [0.25, 0.25, 0.75, 0.75];
    this.startValue = params.start;
    this.onComplete = params.onComplete;
    this.onUpdate = params.onUpdate;
    this.easeType = Keyframe.BEZIER;

    if(this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3]) {
      this.easeType = Keyframe.LINEAR;
    }
  }

  update(progress) {
    let percent = progress; // Keyframe.LINEAR

    if(this.easeType === Keyframe.BEZIER) {
      percent = curveAt(percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3]);
    } else if(this.easeType === Keyframe.HOLD) {
      percent = progress < 1 ? 0 : 1;
    }

    if(!this.active && this.startValue === undefined) {
      this.startValue = this.object[this.key];
    }

    this.object[this.key] = lerp(percent, this.startValue, this.endValue);

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