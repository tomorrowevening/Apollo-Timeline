import { getHex } from 'apollo-utils/DOMUtil';
import text2d from 'three-text2d';

module.exports = function(THREE) {
  var THREELayer = require('./THREELayer')(THREE);
  
  class THREEText extends THREELayer {
    constructor(json, timeline) {
      super(json, timeline);

      this.mesh = new THREE.Object3D();
      this.item.add(this.mesh);

      var fName = json.content.font;
      var fSize = json.content.fontSize * window.devicePixelRatio;
      var offY = Math.round(fSize * 0.33);
      var fColor = getHex(json.content.fillColor[0], json.content.fillColor[1], json.content.fillColor[2]);
      var tColor = new THREE.Color(fColor);
      this.txtSprite = new text2d.SpriteText2D(json.content.text, {
        align: text2d.textAlign.bottomLeft,
        font: fSize.toString() + 'px ' + fName,
        fillStyle: tColor.getStyle(),
        antialias: true
      });
      this.txtSprite.position.y = offY;
      this.mesh.add(this.txtSprite)

      THREELayer.transform(this.item, this.mesh, json.transform, timeline);
    }

    // Getters

    get text() {
      return this.txtSprite.text;
    }

    // Setters

    set text(value) {
      this.txtSprite.text = value;
    }
  }

  return THREEText;
}
