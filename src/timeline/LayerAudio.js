import Loader from 'apollo-utils/Loader';
import Layer from './Layer';

export class LayerAudio extends Layer {
    constructor(obj) {
        super(obj);
        this.timestamp = 0;
        
        if(obj.content !== undefined) {
            this.fileID = Loader.fileID( obj.content.source );
            this.file = Loader.audio[this.fileID];
        }
    }
    
    update(time) {
        const now   = Date.now();
        const delta = (now - this.timestamp) / 1000; // in seconds
        
        if( delta > 1 ) {
            Loader.playAudio( this.fileID );
        }
        
        this.timestamp = now;
    }
}
