import TimelineConfig from './TimelineConfig';
import Layer from './Layer';

export default class LayerImage extends Layer {
  constructor(obj) {
    super(obj);

    if (obj.content !== undefined) {
      this.fileID = TimelineConfig.fileID(obj.content.source);
      this.file = TimelineConfig.images[this.fileID];
    }
  }
}
