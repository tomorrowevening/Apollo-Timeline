import Config from './Config';
import Layer from './Layer';

export class LayerVideo extends Layer {
    constructor(obj) {
        super(obj);
        this.timeStamp = 0;
        
        if(obj.content !== undefined) {
            this.fileID = Config.fileID( obj.content.source );
            this.file = Config.video[this.fileID];
        }
    }
}
