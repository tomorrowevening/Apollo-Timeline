import Loader from 'apollo-utils/Loader';
import Layer from './Layer';

export class LayerVideo extends Layer {
    constructor(obj) {
        super(obj);
        this.timeStamp = 0;
        
        if(obj.content !== undefined) {
            this.fileID = Loader.fileID( obj.content.source );
            this.file = Loader.video[this.fileID];
        }
    }
}
