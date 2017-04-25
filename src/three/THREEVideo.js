import Config from '../timeline/Config';
import THREELayer from './THREELayer';

module.exports = function(THREE) {
    class THREEVideo extends THREELayer {
        constructor(json, timeline) {
            super(json, timeline);
            
            let src     = json.content.source;
            this.fileID = Config.fileID( src );
            this.file   = Config.video[this.fileID];
            this.file.autoplay = false;
            this.file.pause();
            
            let texture  = new THREE.VideoTexture(this.file);
            let geometry = new THREE.PlaneGeometry( json.content.width, json.content.height );
            // Top-left anchor
            geometry.computeBoundingBox();
            let box = geometry.boundingBox;
            let w   = (box.max.x - box.min.x) / 2;
            let h   = (box.max.y - box.min.y) / 2;
            let d   = 0;
            geometry.applyMatrix( new THREE.Matrix4().makeTranslation( w, -h, -d ) );
            
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide, // for 360 rotation
                depthTest: false
            });
            
            this.mesh = new THREE.Mesh( geometry, material );
            this.item.add( this.mesh );
            THREELayer.transform( this.item, this.mesh, json.transform, timeline );
        }
    }
    
    return THREEVideo;
}
