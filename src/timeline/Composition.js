import Layer    from './Layer';
import Timeline from './Timeline';

var TIME = ( performance || Date );

export default class Composition extends Layer {
    constructor(obj) {
        super(obj);
        
        this.layers = [];
        
        this.timeline = new Timeline();
        if(obj.duration !== undefined) {
            this.timeline.duration = obj.duration;
        }
        if(obj.maxPlays !== undefined) {
            this.timeline.maxPlays = obj.maxPlays;
        }
        if(obj.mode !== undefined) {
            this.timeline.mode = obj.mode;
        }
        
        this.showing = this.start === 0;
    }
    
    addLayer(layer) {
        layer.showing = this.start === 0 && layer.start === 0;
        this.layers.push(layer);
    }
    
    update(time) {
        this.timeline.update();
        this.updateLayers();
    }
    
    updateHandler() {
        this.update(this.seconds);
        this.draw();
    }
    
    updateLayers() {
        const time = this.seconds;
        let total = this.layers.length;
        for(let i = 0; i < total; ++i) {
            let l = this.layers[i];
            let visible = l.showable(time);
            if( visible ) {
                if(l instanceof Composition) {
                    if(!l.showing && l.timeline.restartable) {
                        l.timeline.time.stamp = TIME.now();
                    }
                    l.update( time - l.start );
                } else {
                    l.update( time - l.start );
                }
            } else if(l.showing) {
                if(l.timeline.playing && l.timeline.seconds > 0) {
                    l.timeline.seconds = l.timeline.duration;
                    
                    if(l.timeline.time.speed < 0) {
                        l.timeline.seconds = 0;
                    }
                    
                    if( (l.timeline.maxPlays > 0 && l.timeline.timesPlayed >= l.timeline.maxPlays) || l.timeline.mode === "once" ) {
                        l.timeline.playing = false;
                    }
                }
            }
            l.showing = visible;
        }
    }
    
    get seconds() {
        return this.timeline.seconds;
    }
}
