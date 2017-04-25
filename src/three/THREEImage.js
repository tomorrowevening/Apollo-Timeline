import Config from '../timeline/Config';
import THREELayer from './THREELayer';

module.exports = function(THREE) {
    class THREEImage extends THREELayer {
        constructor(json, timeline) {
            super(json, timeline);
            
            const url     = json.content.source;
            const fileID  = Config.fileID( url );
            const image   = Config.images[ fileID ];
            const texture = Config.textures[ fileID ];
            const transparent = url.search(".png") > -1;
            
            let geometry = new THREE.PlaneGeometry( image.width, image.height );
            // Top-left anchor
            geometry.computeBoundingBox();
            let box = geometry.boundingBox;
            let w   = (box.max.x - box.min.x) / 2;
            let h   = (box.max.y - box.min.y) / 2;
            let d   = 0;
            geometry.applyMatrix( new THREE.Matrix4().makeTranslation( w, -h, -d ) );
            
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: transparent,
                side: THREE.DoubleSide, // for 360 rotation
                depthTest: false
            });
            
            this.mesh = new THREE.Mesh( geometry, material );
            this.item.add( this.mesh );
            THREELayer.transform( this.item, this.mesh, json.transform, timeline );
        }
    }
    
    return THREEImage;
}
