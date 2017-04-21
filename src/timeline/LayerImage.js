import Loader from 'apollo-utils/Loader';
import Layer from './Layer';

export class LayerImage extends Layer {
    constructor(obj) {
        super(obj);
        
        if(obj.content !== undefined) {
            this.fileID = Loader.fileID( obj.content.source );
            this.file = Loader.images[this.fileID];
        }
    }
}
