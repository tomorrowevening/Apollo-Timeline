/**
 * Timer
 * @author Colin Duffy
 */

function Timer() {
    
    this.autoPause       = true;
    this.running         = false;
    this.time            = 1;
    this.timeStamp       = 0;
    this.deltaStamp      = 0; // now - before
    this.elapsedStamp    = 0; // Time elapsed
    this.prevStamp       = 0;
    this.timer           = undefined;
    this.onUpdate        = undefined;
    
    this.play = function() {
        this.running    = true;
        this.timeStamp  = Date.now();
        
        if(this.timer === undefined) {
            this.timer = setInterval( this.update.bind(this), 10 );
        }
    };
    
    this.pause = function() {
        this.running = false;
        
        if(this.timer !== undefined) {
            clearInterval( this.timer );
            this.timer = undefined;
        }
    };
    
    this.update = function() {
        if( !this.running ) return;
        
        var now = Date.now();
        this.prevStamp      = this.elapsedStamp;
        this.deltaStamp     = now - this.timeStamp;
        this.elapsedStamp  += this.deltaStamp * this.time;
        this.timeStamp      = now;
        
        if(this.onUpdate !== undefined) this.onUpdate();
    }
    
    this.restart = function() {
        this.deltaStamp = this.elapsedStamp = 0;
        this.stamp();
    };
    
    this.stamp = function() {
        this.timeStamp = Date.now();
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
    return this.restart();
};

Timer.timers = [];

Timer.playAll = function() {
    var total = Timer.timers.length;
    for(var i = 0; i < total; ++i) {
        var t = Timer.timers[i];
        if( t !== undefined ) {
            if( t.autoPause ) t.play();
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
