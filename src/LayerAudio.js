import Loader from 'apollo-utils/Loader';
import TimelineConfig from './TimelineConfig';
import Layer from './Layer';

export default class LayerAudio extends Layer {
  constructor(obj) {
    super(obj);
    this.timestamp = 0;

    if (obj.content !== undefined) {
      this.fileID = TimelineConfig.fileID(obj.content.source);
      this.file = TimelineConfig.audio[this.fileID];
    }
  }

  update(time) {
    const now = Date.now();
    const delta = (now - this.timestamp) / 1000; // in seconds

    if (delta > 1) {
      this.file.play();
      Loader.playAudio( this.fileID );
    }

    this.timestamp = now;
  }
}
