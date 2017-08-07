import TimelineConfig from '../TimelineConfig';

module.exports = function(THREE) {
  require('apollo-utils/ThreeUtil')(THREE);
  var THREELayer = require('./THREELayer')(THREE);
  
  class THREEImage extends THREELayer {
    constructor(json, timeline) {
      super(json, timeline);

      const url = json.content.source;
      const fileID = TimelineConfig.fileID(url);
      const image = TimelineConfig.images[fileID];
      const texture = TimelineConfig.textures[fileID];
      const transparent = url.search('.png') > -1;

      let geometry = new THREE.PlaneGeometry(image.width, image.height);
      geometry.topLeftAnchor(true);

      let material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: transparent,
        side: THREE.DoubleSide, // for 360 rotation
        // depthTest: false
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.item.add(this.mesh);
      THREELayer.transform(this.item, this.mesh, json.transform, timeline);
    }
  }

  return THREEImage;
}
