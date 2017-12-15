import Keyframe from './Keyframe';
import { lerp } from 'apollo-utils/MathUtil';

export default class ArrayKeyframe extends Keyframe {
  constructor(object, key, endValue, duration, params) {
    super(object, key, endValue, duration, params);
  }

  update(progress) {
    let percent = this.getPercent(progress);

    if(this.startValue === undefined) {
      this.startValue = this.object[this.key];
    }
    
    let i, total = this.startValue.length;
    for(i = 0; i < total; ++i) {
      this.object[this.key][i] = lerp(percent, this.startValue[i], this.endValue[i]);
    }

    if(this.onUpdate !== undefined) {
      this.onUpdate(progress, percent);
    }
  }
}