/**
 * Keyframe
 * Values are stored as Arrays for tweening groups, such as a Vector array
 * @author Colin Duffy
 */

var Bezier = require('./Bezier')

var KeyframeType = {
    "LINEAR": "linear",
    "BEZIER": "bezier",
    "HOLD":   "hold"
};

function lerp(value, min, max) {
    return min * ( 1 - value ) + max * value;
};

function Keyframe(object, key, endValue, duration, delay, ease, onComplete, onUpdate, startValue) {
    
    // Time
    this.active          = false;
    this.easeType        = KeyframeType.LINEAR;
    this.ease            = ease  !== undefined ? ease  : [0.25, 0.25, 0.75, 0.75];
    this.timestamp       = delay !== undefined ? delay : 0;
    this.duration        = duration;
    this.autoOrigin      = false; // if the keyframe should update it's start value before tweening
    
    // Object
    this.object          = object;
    this.key             = key;
    this.startValue      = startValue !== undefined ? startValue : [ this.object[this.key] ];
    this.endValue        = endValue;
    
    // Handlers
    this.onUpdate        = onUpdate;
    this.onComplete      = onComplete;
    
    if(this.ease[0] === this.ease[1] && this.ease[2] === this.ease[3]) {
        this.easeType = KeyframeType.LINEAR;
    } else {
        this.easeType = KeyframeType.BEZIER;
    }
    
    this.update = function(progress) {
        var percent = progress; // KeyframeType.LINEAR
        
        if(this.easeType === KeyframeType.BEZIER) {
            percent = Bezier.curveAt( percent, this.ease[0], this.ease[1], this.ease[2], this.ease[3] );
        } else if(this.easeType === KeyframeType.HOLD) {
            percent = progress < 1 ? 0 : 1;
        }
        
        this.object[this.key] = lerp( percent, this.startValue, this.endValue );
        
        if(this.onUpdate !== undefined) {
            this.onUpdate(progress, percent);
        }
    };
    
    this.restart = function() {
        this.object[this.key] = this.startValue;
    };
    
    this.finish = function() {
        this.update(1);
    };
    
    this.complete = function() {
        this.finish();
        
        if(this.onComplete !== undefined) this.onComplete();
        this.active = false;
    };
    
    this.isActive = function(time) {
        return time >= this.startTime && time <= this.endTime;
    };
    
    Object.defineProperty(this, "startTime", {
        get: function() {
            return this.timestamp;
        }
    });
    
    Object.defineProperty(this, "endTime", {
        get: function() {
            return this.timestamp + this.duration;
        }
    });
    
    return this;
};

module.exports = Keyframe;
