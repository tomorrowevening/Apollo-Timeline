export const TIME = ( performance || Date );

/**
 * Timer
 * @author Colin Duffy
 */
export class Timer {
    
    constructor(onUpdate) {
        this.running        = false;
        this.time           = 1;
        this.timeStamp      = 0;
        this.deltaStamp     = 0; // now - before
        this.elapsedStamp   = 0; // Time elapsed
        this.delayed        = [];
        this.onRAF          = undefined;
        this.onUpdate       = this.update.bind(this);
        this.updateHandler  = onUpdate;
    }
    
    play() {
        this.timeStamp = TIME.now();
        this.running = true;
        this.update();
    };
    
    pause() {
        window.cancelAnimationFrame( this.onRAF );
        this.running = false;
    };
    
    restart() {
        this.deltaStamp = this.elapsedStamp = 0;
        this.stamp();
    };
    
    stamp() {
        this.timeStamp = TIME.now();
    };
    
    update() {
        var now = TIME.now();
        this.deltaStamp     = now - this.timeStamp;
        this.elapsedStamp  += this.deltaStamp * this.time;
        this.timeStamp      = now;
        
        let i, delay, total = this.delayed.length;
        for(i = 0; i < total; ++i) {
            delay = this.delayed[i];
            if(now >= delay.time) {
                delay.callback(delay.params);
                // Remove from array
                this.delayed.splice(i, 1);
                --i;
                --total;
            }
        }
        
        this.updateHandler();
        
        this.onRAF = window.requestAnimationFrame( this.onUpdate );
    }
    
    delay(wait, callback, params) {
        this.delayed.push({
            time: wait * 1000 + TIME.now(),
            callback: callback,
            params: params
        });
    }
    
    // Getters
    
    get seconds() {
        return this.elapsedStamp / 1000;
    }
    
    // Setters
    
    set seconds(value) {
        this.elapsedStamp = value * 1000;
    }
    
}
