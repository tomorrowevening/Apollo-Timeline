import { Timer, TIME } from './Timer';

export const PlayMode = {
    "LOOP":      "loop",
    "ONCE":      "once",
    "PING_PONG": "pingPong"
};

export class Timeline {
    
    constructor() {
        this.duration       = 0;
        this.timesPlayed    = 0;
        this.maxPlays       = 0;
        this.mode           = PlayMode.LOOP;
        this.keyframes      = [];
        this.markers        = [];
        this.playing        = true;
        this.lastMarker     = undefined;
        this.time           = {
            elapsed : 0,
            stamp   : 0,
            speed   : 1
        };
    }
    
    add(target, key, to, duration, delay, x0, y0, x1, y1, from, completeHandler, updateHandler) {
        var wait   = this.duration === 0 ? this.seconds + delay : delay;
        var ease   = [ x0, y0, x1, y1 ];
        var newKey = new Keyframe( target, key, to, duration, wait, ease, from, completeHandler, updateHandler );
        return this.addKeyframe( newKey );
    }
    
    addKeyframe(keyframe) {
        this.keyframes.push( keyframe );
        return keyframe;
    }
    
    addMarker(marker) {
        this.markers.push( marker );
        return this;
    }
    
    play() {
        if(this.time.elapsed === 0) {
            var total = this.keyframes.length-1;
            for(var i = total; i > -1; --i) {
                this.keyframes[i].update(0);
                this.keyframes[i].active = false;
            }
        }
        this.playing = true;
    }
    
    pause() {
        this.playing = false;
    }
    
    update() {
        if(!this.playing) return;
        
        let now = TIME.now();
        let delta = now - this.time.stamp;
        this.time.elapsed += delta * this.time.speed;
        this.time.stamp    = now;
        
        // Update play mode settings
        if(this.duration > 0) this.updatePlaymode();
        
        // Markers
        this.updateMarkers();
        
        // Update keyframes
        this.updateKeyframes();
    }
    
    updateKeyframes() {
        var i, now, key, percent, total = this.keyframes.length;
        const seconds = this.seconds;
        
        for(i = 0; i < total; ++i) {
            key = this.keyframes[i];
            now = seconds;
            percent = (now - key.timestamp) / key.duration;
            
            if( key.isActive(now) ) {
                
                // Auto-origin?
                if( !key.active && key.startValue === undefined && this.time.speed > 0 ) {
                    key.startValue = key.object[ key.key ];
                }
                
                key.active = true;
                key.update( percent );
                
            } else if( key.active ) {
                
                key.active = false;
                if(this.time.speed < 0) {
                    key.restart();
                } else {
                    key.complete();
                }
                
            } else {
                
                key.active = false;
                
                // Remove old keyframes that'll never be used again
                if(this.duration === 0 && now - key.timestamp > 1) {
                    this.keyframes.splice(i, 1);
                    --i;
                    --total;
                }
                
            }
            
        }
    }
    
    updateMarkers() {
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
    }
    
    updatePlaymode() {
        const seconds = this.seconds;
        if(this.mode === PlayMode.PING_PONG) {
            
            if(seconds >= this.duration) {
                this.time.elapsed = this.duration * 1000 - 1;
                this.time.speed *= -1;
            } else if(seconds < 0) {
                this.time.elapsed = 1;
                this.time.speed = Math.abs( this.time.speed );
                ++this.timesPlayed;
                
                if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                    this.pause();
                }
            }
            
        } else if(this.mode === PlayMode.LOOP) {
            
            if(seconds > this.duration) {
                ++this.timesPlayed;
                if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                    this.pause();
                    this.time.elapsed = 0;
                } else {
                    this.time.elapsed = 0;
                    var total = this.keyframes.length-1;
                    for(var i = total; i > -1; --i) {
                        this.keyframes[i].update(0);
                        this.keyframes[i].active = false;
                    }
                }
            }
            
        } else { // ONCE
            
            if(seconds > this.duration) {
                ++this.timesPlayed;
                this.pause();
                this.time.elapsed = 0;
            }
            
        }
    }
    
    trigger(index) {
        var marker = this.markers[index];
        if(marker === undefined) return false;
        
        // Timeline actions
        if(marker.action === "stop") {
            this.pause();
            this.seconds = marker.time;
        } else if(marker.action === "delay") {
            // delay call
            marker.trigger();
        }
        
        return true;
    }
    
    // Getters
    
    get playMode() {
        return this.mode;
    }
    
    get seconds() {
        return this.time.elapsed / 1000;
    }
    
    get speed() {
        return this.time.speed;
    }
    
    get restartable() {
        if(!this.playing) return false;
        
        // Loop or PingPong
        if( (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) ) {
            return false;
        }
        
        if(this.mode === PlayMode.LOOP && this.timesPlayed > 0) {
            return false;
        }
        
        return true;
    }
    
    // Setters
    
    set playMode(value) {
        this.mode = value;
        if(value === PlayMode.LOOP || value === PlayMode.ONCE) {
            this.time.speed = Math.abs( this.time.speed );
        }
    }
    
    set seconds(value) {
        this.time.elapsed = value * 1000;
    }
    
    set speed(value) {
        this.time.speed = value;
    }
    
}
