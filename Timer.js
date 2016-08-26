/**
 * Timer
 * @author Colin Duffy
 */

var TIME = ( performance || Date );

function Timer() {
    
    this.name            = "Timer::" + Timer.count.toString();
    this.autoPause       = true;
    this.running         = false;
    this.wasRunning      = false;
    this.time            = 1;
    this.timeStamp       = 0;
    this.deltaStamp      = 0;
    this.elapsedStamp    = 0;
    this.prevStamp       = 0;
    this.performance     = 0;
    this.fps             = 0;
    this.onUpdate        = undefined;
    
    this.play = function() {
        this.running    = true;
        this.timeStamp  = TIME.now();
        
        this.update();
    };
    
    this.pause = function() {
        this.running    = false;
        this.wasRunning = false;
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
        
        if(this.onUpdate !== undefined) this.onUpdate();
        window.requestAnimationFrame( this.update.bind(this) );
    }
    
    this.restart = function() {
        this.deltaStamp = this.elapsedStamp = 0;
        this.stamp();
    };
    
    this.stamp = function() {
        this.timeStamp = TIME.now();
    };
    
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

Timer.count     = 0;
Timer.timers    = [];

Timer.remove = function(me) {
    var i, t, total = Timer.timers.length;
    for(i = 0; i < total; ++i) {
        t = Timer.timers[i];
        if( t === me ) {
            Timer.timers.splice(i, 1);
            return;
        }
    }
}

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
