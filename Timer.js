var Dispatcher = require('apollo-utils/Dispatcher');
var Event = require('apollo-utils/Event');

/**
 * Timer
 * @author Colin Duffy
 */

var TIME = ( performance || Date );

function Timer() {
    Dispatcher.call(this);
    
    this.name           = "Timer::" + Timer.count.toString();
    this.autoPause      = true;
    this.running        = false;
    this.wasRunning     = false;
    this.time           = 1;
    this.timeStamp      = 0;
    this.deltaStamp     = 0; // now - before
    this.elapsedStamp   = 0; // Time elapsed
    this.prevStamp      = 0;
    this.performance    = 0;
    this.fps            = 0;
    
    this.play = function() {
        if(this.running) return;
        this.running    = true;
        this.timeStamp  = TIME.now();
        this.update();
    };
    
    this.pause = function() {
        this.running    = false;
        this.wasRunning = false;
    };
    
    this.restart = function() {
        this.deltaStamp = this.elapsedStamp = 0;
        this.stamp();
    };
    
    this.stamp = function() {
        this.timeStamp = TIME.now();
    };
    
    this.update = function() {
        if( !this.running ) return;
        
        var now = TIME.now();
        this.prevStamp      = this.elapsedStamp;
        this.deltaStamp     = now - this.timeStamp;
        this.fps            = 1000 / this.deltaStamp;
        this.performance    = this.fps / 60;
        this.elapsedStamp  += this.deltaStamp * this.time;
        this.timeStamp      = now;
        
        this.notify( Event.UPDATE );
        
        window.requestAnimationFrame( this.update.bind(this) );
    }
    
    // Getters / Setters
    
    Object.defineProperty(this, "seconds", {
        get: function() {
            return this.elapsedStamp / 1000;
        },
        set: function(value) {
            this.elapsedStamp = value * 1000;
        }
    });
    
    Object.defineProperty(this, "delta", {
        get: function() {
            return this.deltaStamp / 1000;
        }
    });
    
    Object.defineProperty(this, "prevSeconds", {
        get: function() {
            return this.prevStamp / 1000;
        }
    });
    
    Object.defineProperty(this, "frameNum", {
        get: function() {
            return Math.floor( this.seconds * 60 );
        }
    });
    
    Timer.timers.push( this );
    ++Timer.count;
    
    return this.restart();
};

Timer.prototype = Object.create( Dispatcher.prototype );
Timer.prototype.constructor = Timer;

Timer.count  = 0;
Timer.timers = [];

Timer.remove = function(item) {
    var total = Timer.timers.length;
    for(var i = 0; i < total; ++i) {
        if( item === Timer.timers[i] ) {
            Timer.timers.splice(i, 1);
            return true;
        }
    }
    return false;
};

Timer.playAll = function() {
    var total = Timer.timers.length;
    for(var i = 0; i < total; ++i) {
        var t = Timer.timers[i];
        if( t !== undefined ) {
            if( t.autoPause && t.wasRunning ) {
                t.play();
            }
        } else {
            // Remove deleted timers
            Timer.timers.splice(i, 1);
            --i;
            --total;
        }
    }
};

Timer.pauseAll = function() {
    var total = Timer.timers.length;
    for(var i = 0; i < total; ++i) {
        var t = Timer.timers[i];
        if( t !== undefined ) {
            if( t.autoPause && t.running ) {
                t.pause();
                t.wasRunning = true;
            }
        } else {
            // Remove deleted timers
            Timer.timers.splice(i, 1);
            --i;
            --total;
        }
    }
};

module.exports = Timer;
