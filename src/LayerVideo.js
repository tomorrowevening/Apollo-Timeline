import TimelineConfig from './TimelineConfig';
import Layer from './Layer';

export default class LayerVideo extends Layer {
  constructor(obj) {
    super(obj);
    this.timeStamp = 0;

    if (obj.content !== undefined) {
      this.fileID = TimelineConfig.fileID(obj.content.source);
      this.file = TimelineConfig.video[this.fileID];
    }
  }
}
