var THREE       = require('three');
var MathU       = require('apollo-utils/MathUtil');
var Loader      = require('apollo-utils/Loader');
var ThreeU      = require('apollo-utils/ThreeUtil');
var Keyframe    = require('apollo-timeline/Keyframe');
var Layer       = require('apollo-timeline/Layer').Layer;
var LayerAudio  = require('apollo-timeline/Layer').LayerAudio;
var LayerImage  = require('apollo-timeline/Layer').LayerImage;
var LayerShape  = require('apollo-timeline/Layer').LayerShape;
var LayerText   = require('apollo-timeline/Layer').LayerText;
var text2d      = require('three-text2d');
var Config      = require('../models/Config');

//////////////////////////////////////////////////
// Layer

function THREELayer( json, timeline ) {
    Layer.call(this, json);
    
    this.item = new THREE.Object3D();
    this.mesh = undefined; // add to this.item
}
THREELayer.prototype = Object.create( Layer.prototype );
THREELayer.prototype.constructor = THREELayer;

THREELayer.transform = function(layer, transform, timeline) {
    const scale = window.devicePixelRatio;
    const t = transform;
    const a = (t.anchor.length   > 2) ? t.anchor   : [t.anchor[0],   t.anchor[1],   0];
    const p = (t.position.length > 2) ? t.position : [t.position[0], t.position[1], 0];
    const r = (t.rotation.length > 2) ? t.rotation : [t.rotation[0], t.rotation[1], 0];
    const s = (t.scale.length    > 2) ? t.scale    : [t.scale[0],    t.scale[1],    1];
    
    layer.item.position.set( p[0]*scale, -p[1]*scale, p[2]*scale );
    layer.item.scale.set( s[0], s[1], s[2] );
    layer.item.rotation.set( MathU.toRad(r[0]), MathU.toRad(r[1]), -MathU.toRad(r[2]) );
    layer.mesh.position.set( -a[0]*scale, a[1]*scale, a[2]*scale ); // anchor
    
    if(t.timeline === undefined) return;
    
    let i, n, total, nTotal;
    total = t.timeline.length;
    for(i = 0; i < total; ++i) {
        let ani = t.timeline[i];
        nTotal  = ani.keys.length;
        
        for(n = 0; n < nTotal; ++n) {
            const key      = ani.keys[n];
            let from       = key.value;
            const target   = key.target;
            const delay    = key.start;
            const duration = key.duration;
            const x0       = key.x0;
            const y0       = key.y0;
            const x1       = key.x1;
            const y1       = key.y1;
            const ease     = [x0, y0, x1, y1];
            let keyframe   = undefined;
            
            switch(ani.name) {
                case "opacity":
                    keyframe = new Keyframe( layer.mesh.material, 'opacity', target, duration, delay, ease, undefined, undefined, from );
                break;
                
                case "anchorX":
                    keyframe = new Keyframe( layer.mesh.position, 'x', -target*scale, duration, delay, ease, undefined, undefined, -from*scale );
                break;
                case "anchorY":
                    keyframe = new Keyframe( layer.meshposition, 'y', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                
                case "positionX":
                    keyframe = new Keyframe( layer.item.position, 'x', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                case "positionY":
                    from = -key.value;
                    keyframe = new Keyframe( layer.item.position, 'y', -target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                case "positionZ":
                    keyframe = new Keyframe( layer.item.position, 'z', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                
                case "rotationX":
                    from = MathU.toRad( key.value );
                    keyframe = new Keyframe( layer.item.rotation, 'x', MathU.toRad(target), duration, delay, ease, undefined, undefined, from );
                break;
                case "rotationY":
                    from = -MathU.toRad( key.value );
                    keyframe = new Keyframe( layer.item.rotation, 'y', -MathU.toRad(target), duration, delay, ease, undefined, undefined, from );
                break;
                case "rotationZ":
                    from = -MathU.toRad( key.value );
                    keyframe = new Keyframe( layer.item.rotation, 'z', -MathU.toRad(target), duration, delay, ease, undefined, undefined, from );
                break;
                
                case "scaleX":
                    keyframe = new Keyframe( layer.item.scale, 'x', target, duration, delay, ease, undefined, undefined, from );
                break;
                case "scaleY":
                    keyframe = new Keyframe( layer.item.scale, 'y', target, duration, delay, ease, undefined, undefined, from );
                break;
                case "scaleZ":
                    keyframe = new Keyframe( layer.item.scale, 'z', target, duration, delay, ease, undefined, undefined, from );
                break;
            }
            
            if(keyframe !== undefined) {
                keyframe.easeType = key.type;
                timeline.addKeyframe( keyframe );
            }
        }
    }
}

//////////////////////////////////////////////////
// Image layer

function THREEImage( json, timeline ) {
    THREELayer.call(this, json);
    
    const url     = json.content.source;
    const fileID  = Loader.fileID( url );
    const image   = Loader.images[ fileID ];
    const texture = Config.textures[ fileID ];
    const transparent = url.search(".png") > -1;
    
    let geometry = new THREE.PlaneGeometry( image.width, image.height );
    geometry.topLeftAnchor(true);
    
    let material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: transparent,
        side: THREE.DoubleSide, // for 360 rotation
        depthTest: false
    });
    
    this.mesh = new THREE.Mesh( geometry, material );
    this.item.add( this.mesh );
    THREELayer.transform( this, json.transform, timeline );
}

THREEImage.prototype = Object.create( THREELayer.prototype );
THREEImage.prototype.constructor = THREEImage;

//////////////////////////////////////////////////
// Shape layer

function getHex(r, g, b) {
    return ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
}

function THREEShape( json, timeline ) {
    THREELayer.call(this, json);
    
    this.mesh = new THREE.Object3D();
    this.item.add( this.mesh );
    
    THREELayer.transform( this, json.transform, timeline );
}

THREEShape.prototype = Object.create( THREELayer.prototype );
THREEShape.prototype.constructor = THREEShape;

//////////////////////////////////////////////////
// Text layer

function THREEText( json, timeline ) {
    THREELayer.call(this, json);
    
    this.mesh = new THREE.Object3D();
    this.item.add( this.mesh );
    
    var fName = json.content.font;
    var fSize = json.content.fontSize * window.devicePixelRatio;
    var offY  = Math.round(fSize * 0.33);
    var fColor = getHex(json.content.fillColor[0], json.content.fillColor[1], json.content.fillColor[2]);
    var tColor = new THREE.Color( fColor );
    var sprite = new text2d.SpriteText2D(json.content.text, {
        align: text2d.textAlign.bottomLeft,
        font: fSize.toString() + 'px ' + fName,
        fillStyle: tColor.getStyle(),
        antialias: true
    });
    sprite.position.y = offY;
    this.mesh.add(sprite)
    
    THREELayer.transform( this, json.transform, timeline );
}

THREEText.prototype = Object.create( THREELayer.prototype );
THREEText.prototype.constructor = THREEText;

// Export

module.exports = {
    THREELayer  : THREELayer,
    THREEImage  : THREEImage,
    THREEShape  : THREEShape,
    THREEText   : THREEText
};
