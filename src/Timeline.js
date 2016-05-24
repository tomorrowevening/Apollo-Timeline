/**
 * Timeline
 * @author Colin Duffy
 */

var PlayMode = {
    "LOOP":      "loop",
    "ONCE":      "once",
    "PING_PONG": "pingPong"
};

function Timeline() {
    
    this.name            = name !== undefined ? name : "Timeline";
    this.duration        = 0;
    this.timesPlayed     = 0;
    this.maxPlays        = 0;
    this.mode            = PlayMode.LOOP;
    this.keyframes       = [];
    this.markers         = [];
    this.timer           = new Timer();
    this.lastMarker      = undefined; // last triggered Marker
    this.onUpdate        = undefined; // added for demo feedback, unnecessary
    
    this.play = function() {
        this.timer.play();
    };

    this.pause = function() {
        if(!this.playing) return this;
        this.timer.pause();
    };

    this.restart = function() {
        this.timesPlayed = 0;
        this.timer.restart();
    };

    this.update = function() {
        // Update play mode settings
        this.updatePlaymode();
        
        // Markers
        this.updateMarkers();
        
        // Update keyframes
        this.updateKeyframes();
        
        if(this.onUpdate !== undefined) this.onUpdate();
    };
    
    this.updatePlaymode = function() {
        if(this.mode === PlayMode.PING_PONG) {
            
            if(this.timer.seconds >= this.duration) {
                this.timer.elapsedStamp = this.duration * 1000 - 1;
                this.timer.time *= -1;
            } else if(this.timer.seconds < 0) {
                this.timer.elapsedStamp = 1;
                this.timer.time = Math.abs( this.timer.time );
                ++this.timesPlayed;
                
                if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                    this.pause();
                }
            }
            
        } else if(this.mode === PlayMode.LOOP) {
            
            if(this.timer.seconds > this.duration) {
                ++this.timesPlayed;
                if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                    this.pause();
                    this.timer.elapsedStamp = 0;
                } else {
                    this.timer.elapsedStamp = 0;
                    var total = this.keyframes.length-1;
                    for(var i = total; i > -1; --i) {
                        this.keyframes[i].update(0);
                    }
                }
            }
            
        } else { // ONCE
            
            if(this.timer.seconds > this.duration) {
                ++this.timesPlayed;
                this.pause();
                this.timer.elapsedStamp = 0;
            }
            
        }
    };
    
    this.updateKeyframes = function() {
        var pingP = this.mode !== PlayMode.PING_PONG || this.timer.time > 0;
        var now   = this.seconds;
        var total = this.keyframes.length;
        
        for(var i = 0; i < total; ++i) {
            var key = this.keyframes[i];
            var percent = (now - key.timestamp) / key.duration;
            
            if( key.isActive(now) ) {
                // Auto-origin, this updates the Start Value to whatever the object currently is
                if( !key.active ) {
                    key.startValue = [ key.object[ key.keys[0] ] ];
                }
                key.active = true;
                key.update( percent );
                
            } else if( key.active ) {
                
                key.active = false;
                if(pingP) {
                    key.complete();
                } else if(this.timer.time < 0) {
                    key.restart();
                }
                
            } else {
                
                key.active = false;
                
            }
            
        }
    };

    // Play modes
    
    this.loop = function(count) {
        this.playMode = PlayMode.LOOP;
        this.maxPlays = count !== undefined ? count : 0;
    };

    this.pingPong = function(count) {
        this.playMode = PlayMode.PING_PONG;
        this.maxPlays = count !== undefined ? count : 0;
    };

    // Management
    
    this.add = function(target, keys, to, duration, delay, x0, y0, x1, y1, completeHandler, updateHandler, from) {
        var _delay = delay !== undefined ? delay : 0;
        var wait   = this.duration === 0 ? this.seconds + _delay : _delay;
        var ease   = [ x0, y0, x1, y1 ];
        var key    = new Keyframe( target, keys, to, duration, wait, ease, completeHandler, updateHandler, from );
        this.addKeyframe( key );
    };
    
    this.addKeyframe = function(keyframe) {
        this.keyframes.push( keyframe );
    };
    
    this.addMarker = function(marker) {
        this.markers.push( marker );
        return this;
    };

    this.remove = function(index) {
        this.keyframes.splice(index, 1);
    };

    this.clear = function() {
        this.keyframes = [];
    };
    
    this.getMarker = function(name) {
        let i, total = this.markers.length;
        for(i = 0; i < total; ++i) {
            let m = this.markers[i];
            if(m.name === name) return i;
        }
        return -1;
    };
    
    this.goTo = function(time, pause) {
        this.seconds = time;
        if(pause !== true) this.play();
    };
    
    this.goToMarker = function(name) {
        var marker = this.markers[ this.getMarker(name) ];
        if(marker === undefined) return false;
        
        this.goTo( marker.time );
        return true;
    };
    
    this.setTime = function(value) {
        if( this.timer.time < 0 ) {
            this.timer.time = -value;
        } else {
            this.timer.time = value;
        }
    };
    
    this.trigger = function(index) {
        var marker = this.markers[index];
        if(marker === undefined) return false;
        
        if(marker.action === "stop") {
            this.pause();
            this.seconds = marker.time;
        }
        return true;
    };
    
    this.updateMarkers = function() {
        var before = this.prevSeconds;
        var now    = this.seconds;
        if(before > now) return -1; // looping
        
        var min    = Math.min( before, now );
        var max    = Math.max( before, now );
        var total  = this.markers.length;
        for(var i = 0; i < total; ++i) {
            var m = this.markers[i].time;
            if( (m > min && m <= max) && this.markers[i] !== this.lastMarker ) {
                this.trigger(i);
                this.lastMarker = this.markers[i];
                return i;
            }
        }
        
        this.lastMarker = undefined;
        
        return -1;
    };
    
    // Getters /  Setters
    
    Object.defineProperty(this, "playMode", {
        get: function() {
            return this.mode;
        },
        set: function(value) {
            this.mode = value;
            if(value === PlayMode.LOOP || value === PlayMode.ONCE) {
                this.timer.time = Math.abs( this.timer.time );
            }
        }
    });
    
    Object.defineProperty(this, "seconds", {
        get: function() {
            if(this.duration > 0) return this.timer.seconds % this.duration;
            return this.timer.seconds;
        },
        set: function(value) {
            this.timer.seconds = value;
        }
    });
    
    Object.defineProperty(this, "playing", {
        get: function() {
            return this.timer.running;
        }
    });
    
    Object.defineProperty(this, "frameNum", {
        get: function() {
            return this.timer.frameNum;
        }
    });
    
    Object.defineProperty(this, "delta", {
        get: function() {
            return this.timer.delta;
        }
    });
    
    Object.defineProperty(this, "prevSeconds", {
        get: function() {
            return this.timer.prevSeconds;
        }
    });
    
    this.timer.onUpdate = this.update.bind(this);
    this.timer.restart();
    
    return this;
};
