import TimelineConfig from '../TimelineConfig';

module.exports = function(THREE) {
  require('apollo-utils/ThreeUtil')(THREE);
  var THREELayer = require('./THREELayer')(THREE);
  
  class THREEVideo extends THREELayer {
    constructor(json, timeline) {
      super(json, timeline);

      let src = json.content.source;
      this.fileID = TimelineConfig.fileID(src);
      this.file = TimelineConfig.video[this.fileID];
      this.file.autoplay = false;
      this.file.pause();

      let texture = new THREE.VideoTexture(this.file);
      let geometry = new THREE.PlaneGeometry(json.content.width, json.content.height);
      geometry.topLeftAnchor(true);

      let material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide, // for 360 rotation
        depthTest: false
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.item.add(this.mesh);
      THREELayer.transform(this.item, this.mesh, json.transform, timeline);
    }
  }

  return THREEVideo;
}
