import Bezier from './Bezier';

const KeyframeType = {
    "LINEAR": "linear",
    "BEZIER": "bezier",
    "HOLD":   "hold"
};

function lerp(value, min, max) {
    return min * ( 1 - value ) + max * value;
};

export default class Keyframe {
    
    constructor(object, key, endValue, duration, delay, ease, startValue, onComplete, onUpdate) {
        // Time
        this.active         = false;
        this.ease           = ease  !== undefined ? ease  : [0.25, 0.25, 0.75, 0.75];
        this.timestamp      = delay !== undefined ? delay : 0;
        this.duration       = duration;
        
        // Object
        this.object         = object;
        this.key            = key;
        this.startValue     = startValue;
        this.endValue       = endValue;
        this.onComplete     = onComplete;
        this.onUpdate       = onUpdate;
        
        if(this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3]) {
            this.easeType = KeyframeType.LINEAR;
        } else {
            this.easeType = KeyframeType.BEZIER;
        }
    }
    
    update(progress) {
        let percent = progress; // KeyframeType.LINEAR
        
        if(this.easeType === KeyframeType.BEZIER) {
            percent = Bezier.curveAt( percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3] );
        } else if(this.easeType === KeyframeType.HOLD) {
            percent = progress < 1 ? 0 : 1;
        }
        
        this.object[this.key] = lerp( percent, this.startValue, this.endValue );
        
        if(this.onUpdate !== undefined) {
            this.onUpdate(progress, percent);
        }
    }
    
    restart() {
        this.object[this.key] = this.startValue;
    }
    
    finish() {
        this.update(1);
    }
    
    complete() {
        this.finish();
        
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
