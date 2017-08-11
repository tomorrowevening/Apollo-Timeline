/**
 * After Effects layer
 */
export default class Layer {
  constructor(obj) {
    this.name = obj.name !== undefined ? obj.name : '';
    this.start = obj.start !== undefined ? obj.start : 0; // start time
    this.duration = obj.duration !== undefined ? obj.duration : 0; // duration the layer is in comp
    this.fileID = ''; // to reclaim from loader
    this.file = undefined; // actual loaded asset
    this.item = undefined; // Object layer
    this.showing = obj.showing !== undefined ? obj.showing : true;
  }

  update(time) {
    if (this.item !== undefined && this.item.update !== undefined) {
      this.item.update(time);
    }
  }

  draw() {
    if (this.item !== undefined && this.item.draw !== undefined) {
      this.item.draw();
    }
  }
  
  resize(w, h) {
    if (this.item !== undefined && this.item.resize !== undefined) {
      this.item.resize(w, h);
    }
  }

  animate(json, timeline) {
    if (this.item !== undefined && this.item.animate !== undefined) {
      this.item.animate(json, timeline);
    }
  }

  transform(json, timeline) {
    if (this.item !== undefined && this.item.transform !== undefined) {
      this.item.transform(json, timeline);
    }
  }

  showable(time) {
    const endTime = this.start + this.duration;
    return (this.duration > 0) ? (time >= this.start && time <= endTime) : true;
  }
}
