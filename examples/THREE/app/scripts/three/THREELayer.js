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

THREELayer.transform = function(container, mesh, transform, timeline) {
    const scale = window.devicePixelRatio;
    const t = transform;
    const a = (t.anchor.length   > 2) ? t.anchor   : [t.anchor[0],   t.anchor[1],   0];
    const p = (t.position.length > 2) ? t.position : [t.position[0], t.position[1], 0];
    const r = (t.rotation.length > 2) ? t.rotation : [t.rotation[0], t.rotation[1], 0];
    const s = (t.scale.length    > 2) ? t.scale    : [t.scale[0],    t.scale[1],    1];
    
    container.position.set( p[0]*scale, -p[1]*scale, p[2]*scale );
    container.scale.set( s[0], s[1], s[2] );
    container.rotation.set( MathU.toRad(r[0]), MathU.toRad(r[1]), -MathU.toRad(r[2]) );
    mesh.position.set( -a[0]*scale, a[1]*scale, a[2]*scale ); // anchor
    if(mesh.material !== undefined) mesh.material.opacity = t.opacity;
    
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
                    keyframe = new Keyframe( mesh.material, 'opacity', target, duration, delay, ease, undefined, undefined, from );
                break;
                
                case "anchorX":
                    keyframe = new Keyframe( mesh.position, 'x', -target*scale, duration, delay, ease, undefined, undefined, -from*scale );
                break;
                case "anchorY":
                    keyframe = new Keyframe( mesh.position, 'y', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                
                case "positionX":
                    keyframe = new Keyframe( container.position, 'x', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                case "positionY":
                    keyframe = new Keyframe( container.position, 'y', -target*scale, duration, delay, ease, undefined, undefined, -from*scale );
                break;
                case "positionZ":
                    keyframe = new Keyframe( container.position, 'z', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                
                case "rotationX":
                    keyframe = new Keyframe( container.rotation, 'x', MathU.toRad(target), duration, delay, ease, undefined, undefined, MathU.toRad(from) );
                break;
                case "rotationY":
                    keyframe = new Keyframe( container.rotation, 'y', -MathU.toRad(target), duration, delay, ease, undefined, undefined, MathU.toRad(-from) );
                break;
                case "rotationZ":
                    keyframe = new Keyframe( container.rotation, 'z', -MathU.toRad(target), duration, delay, ease, undefined, undefined, MathU.toRad(-from) );
                break;
                
                case "scaleX":
                    keyframe = new Keyframe( container.scale, 'x', target, duration, delay, ease, undefined, undefined, from );
                break;
                case "scaleY":
                    keyframe = new Keyframe( container.scale, 'y', target, duration, delay, ease, undefined, undefined, from );
                break;
                case "scaleZ":
                    keyframe = new Keyframe( container.scale, 'z', target, duration, delay, ease, undefined, undefined, from );
                break;
            }
            
            if(keyframe !== undefined) {
                keyframe.easeType = key.type;
                timeline.addKeyframe( keyframe );
            }
        }
    }
}

THREELayer.morph = function(layer, path, timeline, closed) {
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
    THREELayer.transform( this.item, this.mesh, json.transform, timeline );
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
    
    // Create shape
    const s = window.devicePixelRatio;
    let parent = this.mesh;
    
    function createShape(content) {
        let i, totalC = content.length;
        for(i = 0; i < totalC; ++i) {
            let cLayer  = content[i];
            let isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
            if(isShape) {
                let n, nTotal;
                
                // Cycle through the content to find fill, stroke, and transform
                let geometry, mesh, shape, fill, stroke, material, color, container, transform = {
                    opacity : 1,
                    anchor  : [0, 0, 0],
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale   : [1, 1, 1],
                    timeline: []
                };
                nTotal = cLayer.content.length;
                for(n = 0; n < nTotal; ++n) {
                    let nLayer = cLayer.content[n];
                    switch(nLayer.type) {
                        case "fill":
                            fill = {
                                alpha: nLayer.opacity,
                                color: nLayer.color
                            };
                        break;
                        
                        case "stroke":
                            stroke = {
                                alpha: nLayer.opacity,
                                color: nLayer.color,
                                width: nLayer.width
                            }
                        break;
                        
                        case "transform":
                            transform = nLayer;
                        break;
                    }
                }
                
                if(stroke !== undefined) {
                    color    = new THREE.Color( stroke.color[0], stroke.color[1], stroke.color[2] );
                    material = new THREE.MeshBasicMaterial({
                        color       : color,
                        opacity     : stroke.alpha,
                        side        : THREE.DoubleSide,
                        transparent : true,
                        depthTest   : false,
                        wireframe   : true
                    });
                    // material = new THREE.LineBasicMaterial({
                    //     color       : color,
                    //     opacity     : stroke.alpha,
                    //     linewidth   : stroke.width,
                    //     side        : THREE.DoubleSide,
                    //     transparent : true,
                    //     depthTest   : false
                    // });
                } else if(fill !== undefined) {
                    color    = new THREE.Color( fill.color[0], fill.color[1], fill.color[2] );
                    material = new THREE.MeshBasicMaterial({
                        color       : color,
                        opacity     : fill.alpha,
                        side        : THREE.DoubleSide,
                        transparent : true,
                        depthTest   : false
                    });
                }
                
                shape = new THREE.Shape();
                
                // Draw paths
                nTotal = cLayer.paths.length;
                
                for(n = 0; n < nTotal; ++n) {
                    let angle, pt, pts, x, y, w, h, t, u, poly, totalPoints, path = cLayer.paths[n];
                    switch(path.type) {
                        case "ellipse":
                            x = path.x*s;
                            y = path.y*s;
                            w = (path.width /2)*s;
                            h = (path.height/2)*s;
                            shape.ellipse(x, y, w, h, 0, MathU.TWO_PI, true);
                        break;
                        
                        case "rectangle":
                            x = (path.x-(path.width /2))*s;
                            y = (path.y-(path.height/2))*s;
                            w = path.width*s;
                            h = path.height*s;
                            shape.moveTo(x, y);
                            shape.lineTo(x+w, y);
                            shape.lineTo(x+w, y+h);
                            shape.lineTo(x, y+h);
                            shape.lineTo(x, y);
                        break;
                        
                        case "polygon":
                            totalPoints = path.points;
                            w = path.radius*s;
                            angle = MathU.HALF_PI; // 90 degrees
                            shape.moveTo(
                                Math.cos(angle) * w,
                                Math.sin(angle) * w
                            );
                            for(t = 1; t < path.points+1; ++t) {
                                angle = (t / totalPoints) * MathU.TWO_PI + MathU.HALF_PI; // 90 degrees
                                shape.lineTo(
                                    Math.cos(angle) * w,
                                    Math.sin(angle) * w
                                );
                            }
                        break;
                        
                        case "polystar":
                            totalPoints = path.points*2;
                            w = path.outRadius*s;
                            h = path.inRadius *s;
                            angle = MathU.toRad(path.rotation) + MathU.HALF_PI; // 90 degrees
                            shape.moveTo(
                                Math.cos(angle) * w,
                                Math.sin(angle) * w
                            );
                            
                            angle = (1 / totalPoints) * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI; // 90 degrees
                            shape.lineTo(
                                Math.cos(angle) * h,
                                Math.sin(angle) * h
                            );
                            
                            for(t = 1; t < path.points; ++t) {
                                angle = ((t*2) / totalPoints) * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI; // 90 degrees
                                shape.lineTo(
                                    Math.cos(angle) * w,
                                    Math.sin(angle) * w
                                );
                                
                                angle = ((t*2+1) / totalPoints) * MathU.TWO_PI + MathU.toRad(path.rotation) + MathU.HALF_PI; // 90 degrees
                                shape.lineTo(
                                    Math.cos(angle) * h,
                                    Math.sin(angle) * h
                                );
                            }
                        break;
                        
                        case "shape":
                            totalPoints = path.vertices.length;
                            shape.moveTo( path.vertices[0][0]*s, path.vertices[0][1]*-s );
                            for(u = 0; u < totalPoints; ++u) {
                                t = u+1;
                                if(path.closed) t = t % totalPoints;
                                else if(t >= totalPoints) break;
                                shape.bezierCurveTo(
                                    (path.vertices[u][0] + path.outTangents[u][0])*s,
                                    (path.vertices[u][1] + path.outTangents[u][1])*-s,
                                    (path.vertices[t][0] +  path.inTangents[t][0])*s,
                                    (path.vertices[t][1] +  path.inTangents[t][1])*-s,
                                    (path.vertices[t][0])*s,
                                    path.vertices[t][1]*-s
                                );
                            }
                            THREELayer.morph( shape, path, timeline, path.closed );
                        break;
                    }
                }
                
                container = new THREE.Object3D();
                parent.add( container );
                
                geometry = new THREE.ShapeGeometry( shape );
                mesh = new THREE.Mesh(geometry, material);
                
                THREELayer.transform( container, mesh, transform, timeline );
                container.add( mesh );
            } else {
                let group = new THREE.Object3D();
                group.name = cLayer.name;
                parent.add( group );
                parent = group;
                createShape( cLayer.content );
            }
        }
    }
    createShape( json.content );
    
    THREELayer.transform( this.item, this.mesh, json.transform, timeline );
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
    
    THREELayer.transform( this.item, this.mesh, json.transform, timeline );
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
