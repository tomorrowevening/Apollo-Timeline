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

function Keyframe(object, keys, endValue, duration, delay, ease, onComplete, onUpdate, startValue) {
    
    // Time
    this.active          = false;
    this.easeType        = KeyframeType.LINEAR;
    this.ease            = ease  !== undefined ? ease  : [0.25, 0.25, 0.75, 0.75];
    this.timestamp       = delay !== undefined ? delay : 0;
    this.duration        = duration;
    this.autoOrigin      = false; // if the keyframe should update it's start value before tweening
    
    // Object
    this.object          = object;
    this.keys            = Array.isArray(keys) ? keys : [ keys ];
    this.startValue      = startValue !== undefined ? ( Array.isArray(startValue) ? startValue: [ startValue ] ) : [ this.object[ this.keys[0] ] ];
    this.endValue        = Array.isArray(endValue)  ? endValue   : [ endValue ];
    this.multiArray      = Array.isArray(this.startValue[0]);
    
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
        
        var k, kTotal = this.keys.length;
        
        if(this.multiArray) {
            
            for(k = 0; k < kTotal; ++k) {
                var key = this.keys[k];
                var n, nTotal = this.startValue.length;
                for(n = 0; n < nTotal; ++n) {
                    var i, iTotal = this.startValue[n].length;
                    for(i = 0; i < iTotal; ++i) {
                        var start = this.startValue[n][i];
                        var end   = this.endValue[n][i];
                        var value = lerp( percent, start, end );
                        this.object[key][n][i] = value;
                    }
                }
            }
            
        } else {
            
            for(k = 0; k < kTotal; ++k) {
                var key   = this.keys[k];
                var start = this.startValue[k];
                var end   = this.endValue[k];
                var value = lerp( percent, start, end );
                this.object[key] = value;
            }
            
        }
        
        if(this.onUpdate !== undefined) {
            this.onUpdate(progress, percent);
        }
    };
    
    this.restart = function() {
        var total = this.keys.length;
        for(var i = 0; i < total; ++i) {
            var key   = this.keys[i];
            var start = this.startValue[i];
            this.object[key] = start;
        }
    };
    
    this.finish = function() {
        var total = this.keys.length;
        for(var i = 0; i < total; ++i) {
            var key   = this.keys[i];
            var end   = this.endValue[i];
            this.object[key] = end;
        }
    };
    
    this.complete = function() {
        this.finish();
        
        if(this.onComplete !== undefined) this.onComplete();
        this.active = false;
    };
    
    this.isActive = function(time) {
        return time >= this.timestamp && time < (this.timestamp+this.duration);
    };
    
    return this;
};

module.exports = Keyframe;
