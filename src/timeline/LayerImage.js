import Config from './Config';
import Layer from './Layer';

export class LayerImage extends Layer {
    constructor(obj) {
        super(obj);
        
        if(obj.content !== undefined) {
            this.fileID = Config.fileID( obj.content.source );
            this.file = Config.images[this.fileID];
        }
    }
}
