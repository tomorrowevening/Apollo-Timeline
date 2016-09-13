var PIXI        = require('pixi.js');
var MathU       = require('apollo-utils/MathUtil');
var Loader      = require('apollo-utils/Loader');
var Keyframe    = require('apollo-timeline/Keyframe');
var Layer       = require('apollo-timeline/Layer').Layer;
var LayerAudio  = require('apollo-timeline/Layer').LayerAudio;
var LayerImage  = require('apollo-timeline/Layer').LayerImage;
var LayerShape  = require('apollo-timeline/Layer').LayerShape;
var LayerText   = require('apollo-timeline/Layer').LayerText;

//////////////////////////////////////////////////
// Layer

function PIXILayer( json, timeline ) {
    Layer.call(this, json);
    
    this.item = new PIXI.Container();
    this.name = json.name;
        
    if(json.transform !== undefined) {
        var scale       = window.devicePixelRatio;
        this.item.alpha      = json.transform.opacity;
        this.item.pivot.x    = json.transform.anchor[0]*scale;
        this.item.pivot.y    = json.transform.anchor[1]*scale;
        this.item.position.x = json.transform.position[0]*scale;
        this.item.position.y = json.transform.position[1]*scale;
        this.item.rotation   = MathU.toRad(json.transform.rotation[2]);
        this.item.scale.x    = json.transform.scale[0];
        this.item.scale.y    = json.transform.scale[1];
    }
    
    PIXILayer.transform( this.item, json.transform, timeline );
    PIXILayer.createMasks( this.item, json.masks, timeline );
}

PIXILayer.createMasks = function(layer, masks, timeline) {
    if(masks === undefined || masks.length === 0) return;
    
    var scale = window.devicePixelRatio,
        offX = layer.pivot.x,
        offY = layer.pivot.y;
    
    var mask = new PIXI.Graphics();
    mask.beginFill(0xffffff, 1);
    var i, total = masks.length;
    for(i = 0; i < total; ++i) {
        var content = masks[i];
        var n, t, nTotal = content.vertices.length;
        mask.moveTo( (content.vertices[0][0]-offX)*scale, (content.vertices[0][1]-offY)*scale )
        for(n = 0; n < nTotal; ++n) {
            t = (n+1) % nTotal;
            mask.bezierCurveTo(
                (content.vertices[n][0]+content.outTangents[n][0]-offX)*scale,
                (content.vertices[n][1]+content.outTangents[n][1]-offY)*scale,
                (content.vertices[t][0]+ content.inTangents[t][0]-offX)*scale,
                (content.vertices[t][1]+ content.inTangents[t][1]-offY)*scale,
                (content.vertices[t][0]-offX)*scale,
                (content.vertices[t][1]-offY)*scale
            );
        }
        
        PIXILayer.morph( mask, content, timeline, true );
        
    }
    layer.addChild( mask );
    layer.mask = mask;
    return mask;
}

PIXILayer.transform = function(layer, transform, timeline) {
    if(transform.timeline === undefined) return;
    
    var scale = window.devicePixelRatio;
    var i, n, total, nTotal;
    total = transform.timeline.length;
    for(i = 0; i < total; ++i) {
        var ani = transform.timeline[i];
        nTotal  = ani.keys.length;
        
        for(n = 0; n < nTotal; ++n) {
            var key      = ani.keys[n];
            var from     = key.value;
            var target   = key.target;
            var delay    = key.start;
            var duration = key.duration;
            var x0       = key.x0;
            var y0       = key.y0;
            var x1       = key.x1;
            var y1       = key.y1;
            var ease     = [x0, y0, x1, y1];
            var keyframe   = undefined;
            
            
            switch(ani.name) {
                case "opacity":
                    keyframe = new Keyframe( layer, 'alpha', target, duration, delay, ease, undefined, undefined, from );
                break;
                
                case "positionX":
                    keyframe = new Keyframe( layer.position, 'x', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                case "positionY":
                    keyframe = new Keyframe( layer.position, 'y', target*scale, duration, delay, ease, undefined, undefined, from*scale );
                break;
                
                case "rotationZ":
                    keyframe = new Keyframe( layer, 'rotation', MathU.toRad(target), duration, delay, ease, undefined, undefined, MathU.toRad(from) );
                break;
                
                case "scaleX":
                    keyframe = new Keyframe( layer.scale, 'x', target, duration, delay, ease, undefined, undefined, from );
                break;
                case "scaleY":
                    keyframe = new Keyframe( layer.scale, 'y', target, duration, delay, ease, undefined, undefined, from );
                break;
            }
            
            if(keyframe !== undefined) {
                keyframe.easeType = key.type;
                timeline.addKeyframe( keyframe );
            }
        }
    }
}

PIXILayer.morph = function(layer, path, timeline, closed) {
    if(path.timeline === undefined) return;
    
    var lStyle = {
        alpha: layer.lineAlpha,
        color: layer.lineColor,
        width: layer.lineWidth
    };
    var fStyle = {
        alpha: layer.fillAlpha,
        color: layer.fillColor
    };
    
    var scale = window.devicePixelRatio;
    var i, n, s, t, total, nTotal, x0, y0, x1, y1, x, y;
    total = path.timeline.length;
    for(i = 0; i < total; ++i) {
        var ani = path.timeline[i];
        nTotal  = ani.keys.length;
        
        for(n = 0; n < nTotal; ++n) {
            var key      = ani.keys[n];
            var delay       = key.start;
            var duration    = key.duration;
            var ease        = [key.x0, key.y0, key.x1, key.y1];
            const data      = {
                index       : n,
                value       : 0,
                total       : key.verticesValue.length,
                vertsValue  : key.verticesValue,
                vertsTarget : key.verticesTarget,
                tanInValue  : key.inTangentsValue,
                tanInTarget : key.inTangentsTarget,
                tanOutValue : key.outTangentsValue,
                tanOutTarget: key.outTangentsTarget
            };
            var keyframe   = new Keyframe( data, 'value', 1, duration, delay, ease, undefined, function(percent, curved) {
                layer.clear();
                if(lStyle.width > 0) layer.lineStyle(lStyle.width, lStyle.color, lStyle.alpha);
                if(fStyle.color !== undefined) layer.beginFill(fStyle.color, fStyle.alpha);
                
                layer.moveTo(
                    MathU.lerp(curved, data.vertsValue[0][0], data.vertsTarget[0][0])*scale,
                    MathU.lerp(curved, data.vertsValue[0][1], data.vertsTarget[0][1])*scale
                );
                
                for(s = 0; s < data.total; ++s) {
                    t = s+1;
                    if(closed) t = t % data.total;
                    else if(t >= data.total) break;
                    
                    x0 = MathU.lerp(curved,
                        data.vertsValue[s][0]  + data.tanOutValue[s][0],
                        data.vertsTarget[s][0] + data.tanOutTarget[s][0]
                    )*scale;
                    y0 = MathU.lerp(curved,
                        data.vertsValue[s][1]  + data.tanOutValue[s][1],
                        data.vertsTarget[s][1] + data.tanOutTarget[s][1]
                    )*scale;
                    
                    x1 = MathU.lerp(curved,
                        data.vertsValue[t][0]  + data.tanInValue[t][0],
                        data.vertsTarget[t][0] + data.tanInTarget[t][0]
                    )*scale;
                    y1 = MathU.lerp(curved,
                        data.vertsValue[t][1]  + data.tanInValue[t][1],
                        data.vertsTarget[t][1] + data.tanInTarget[t][1]
                    )*scale;
                    
                    x = MathU.lerp(curved,
                        data.vertsValue[t][0],
                        data.vertsTarget[t][0]
                    )*scale;
                    y = MathU.lerp(curved,
                        data.vertsValue[t][1],
                        data.vertsTarget[t][1]
                    )*scale;
                    
                    layer.bezierCurveTo(x0, y0, x1, y1, x, y);
                }
            } );
            
            keyframe.easeType = key.type;
            timeline.addKeyframe( keyframe );
        }
    }
}
PIXILayer.prototype = Object.create( Layer.prototype );
PIXILayer.prototype.constructor = PIXILayer;

//////////////////////////////////////////////////
// Image Layer

function PIXIImage( json, timeline ) {
    PIXILayer.call(this, json, timeline);
    
    var src     = json.content.source;
    var imgID   = Loader.fileID( src );
    var img     = Loader.images[imgID];
    var spr     = new PIXI.Sprite( new PIXI.Texture( new PIXI.BaseTexture(img) ) );
    this.item.addChild( spr );
}
PIXIImage.prototype = Object.create( PIXILayer.prototype );
PIXIImage.prototype.constructor = PIXIImage;

//////////////////////////////////////////////////
// Shape Layer

function getHex(r, g, b) {
    return ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
}

function drawPoly(radius, points) {
    var pts = [], i, total = points-1;
    for(i = 0; i < points; ++i) {
        var angle = (i / total) * (Math.PI*2);
        var x = Math.cos(angle) * radius;
        var y = Math.sin(angle) * radius;
        pts.push( new PIXI.Point(x, y) );
    }
    return pts;
}

function PIXIShape( json, timeline ) {
    PIXILayer.call(this, json, timeline);
    
    let parent = this.item;
    function createShape(content) {
        const scale = window.devicePixelRatio;
        let i, totalC = content.length;
        for(i = 0; i < totalC; ++i) {
            let cLayer  = content[i];
            let isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
            if(isShape) {
                let shape = new PIXI.Graphics();
                shape.name = cLayer.name;
                parent.addChild( shape );
                
                let n, nTotal;
                
                // Cycle through the content to find fill, stroke, and transform
                let fill, stroke, transform = {
                    opacity : 1,
                    rotation: 0,
                    anchor  : [0, 0],
                    position: [0, 0],
                    scale   : [1, 1],
                    timeline: []
                };
                nTotal = cLayer.content.length;
                for(n = 0; n < nTotal; ++n) {
                    let nLayer = cLayer.content[n];
                    switch(nLayer.type) {
                        case "fill":
                            fill = {
                                alpha: nLayer.opacity,
                                color: getHex(nLayer.color[0], nLayer.color[1], nLayer.color[2])
                            };
                        break;
                        
                        case "stroke":
                            stroke = {
                                alpha: nLayer.opacity,
                                color: getHex(nLayer.color[0], nLayer.color[1], nLayer.color[2]),
                                width: nLayer.width * scale
                            }
                        break;
                        
                        case "transform":
                            shape.alpha         = nLayer.opacity;
                            shape.pivot.x       = nLayer.anchor[0];
                            shape.pivot.y       = nLayer.anchor[1];
                            shape.position.x    = nLayer.position[0]*scale;
                            shape.position.y    = nLayer.position[1]*scale;
                            shape.scale.x       = nLayer.scale[0];
                            shape.scale.y       = nLayer.scale[1];
                            shape.rotation      = MathU.toRad( nLayer.rotation[2] );
                            PIXILayer.transform( shape, nLayer, timeline );
                        break;
                    }
                }
                
                if(stroke !== undefined) {
                    shape.lineStyle(stroke.width, stroke.color, stroke.alpha);
                }
                if(fill !== undefined) {
                    shape.beginFill(fill.color, fill.alpha);
                }
                
                // Draw paths
                nTotal = cLayer.paths.length;
                
                for(n = 0; n < nTotal; ++n) {
                    let angle, pt, pts, s, t, poly, totalPoints, path = cLayer.paths[n];
                    
                    switch(path.type) {
                        case "ellipse":
                            shape.drawEllipse( path.x*scale, path.y*scale, (path.width*scale)/2, (path.height*scale)/2 );
                        break;
                        
                        case "rectangle":
                            shape.drawRect( (path.x-(path.width/2))*scale, (path.y-(path.height/2))*scale, path.width*scale, path.height*scale );
                        break;
                        
                        case "polygon":
                            pts = [], totalPoints = path.points;
                            for(s = 0; s < path.points+1; ++s) {
                                angle = (s / totalPoints) * (Math.PI*2) - (Math.PI/2); // - 90 degrees
                                pt = new PIXI.Point(
                                    Math.cos(angle) * (path.radius*scale),
                                    Math.sin(angle) * (path.radius*scale)
                                );
                                pts.push( pt );
                            }
                            poly = new PIXI.Polygon(pts);
                            poly.closed = path.closed;
                            shape.drawShape( poly );
                        break;
                        
                        case "polystar":
                            pts = [], totalPoints = path.points*2;
                            for(s = 0; s < path.points+1; ++s) {
                                angle = ((s*2) / totalPoints) * (Math.PI*2) + MathU.toRad(path.rotation) - (Math.PI/2); // - 90 degrees
                                pt = new PIXI.Point(
                                    Math.cos(angle) * (path.outRadius*scale),
                                    Math.sin(angle) * (path.outRadius*scale)
                                );
                                pts.push( pt );
                                
                                angle = ((s*2+1) / totalPoints) * (Math.PI*2) + MathU.toRad(path.rotation) - (Math.PI/2); // - 90 degrees
                                pt = new PIXI.Point(
                                    Math.cos(angle) * (path.inRadius*scale),
                                    Math.sin(angle) * (path.inRadius*scale)
                                );
                                pts.push( pt );
                            }
                            poly = new PIXI.Polygon(pts);
                            poly.closed = path.closed;
                            shape.drawShape( poly );
                        break;
                        
                        case "shape":
                            totalPoints = path.vertices.length;
                            shape.moveTo( path.vertices[0][0]*scale, path.vertices[0][1]*scale );
                            for(s = 0; s < totalPoints; ++s) {
                                t = s+1;
                                if(path.closed) t = t % totalPoints;
                                else if(t >= totalPoints) break;
                                shape.bezierCurveTo(
                                    (path.vertices[s][0] + path.outTangents[s][0])*scale,
                                    (path.vertices[s][1] + path.outTangents[s][1])*scale,
                                    (path.vertices[t][0] +  path.inTangents[t][0])*scale,
                                    (path.vertices[t][1] +  path.inTangents[t][1])*scale,
                                    (path.vertices[t][0])*scale,
                                    path.vertices[t][1]*scale
                                );
                            }
                            PIXILayer.morph( shape, path, timeline, path.closed );
                        break;
                    }
                }
            } else {
                let group = new PIXI.Container();
                group.name = cLayer.name;
                parent.addChild( group );
                parent = group;
                createShape( cLayer.content, parent );
            }
        }
    }
    createShape( json.content );
}
PIXIShape.prototype = Object.create( PIXILayer.prototype );
PIXIShape.prototype.constructor = PIXIShape;

//////////////////////////////////////////////////
// Text Layer

function PIXIText( json, timeline ) {
    PIXILayer.call(this, json, timeline);
    
    var fName = json.content.font;
    var fSize = json.content.fontSize * window.devicePixelRatio;
    var offY  = -Math.round(fSize * 0.725);
    var style = {
        fontFamily  : fName,
        fontSize    : fSize,
        fill        : getHex(json.content.fillColor[0], json.content.fillColor[1], json.content.fillColor[2]),
        align       : json.content.justification
    };
    
    this.pText = new PIXI.Text( json.content.text, style );
    this.pText.position.y = offY;
    this.item.addChild( this.pText );
}
PIXIText.prototype = Object.create( PIXILayer.prototype );
PIXIText.prototype.constructor = PIXIText;

// Export

module.exports = {
    PIXILayer   : PIXILayer,
    PIXIImage   : PIXIImage,
    PIXIShape   : PIXIShape,
    PIXIText    : PIXIText
};