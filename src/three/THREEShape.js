import THREELayer from './THREELayer';

const StrokeVertex = `
    uniform float thickness;,
    attribute float lineMiter;,
    attribute vec2 lineNormal;,
    attribute vec2 lineDistance;, // x = pos, y = total length
    varying vec2 lineU;,

    void main() {,
        lineU = lineDistance;,
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);,
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );,
    }
`;

const StrokeFragment = `
    varying vec2 lineU;,

    uniform vec3 diffuse;,
    uniform float opacity;,
    uniform vec3 dash;, // x = dash,  y = gap, z = offset
    uniform vec3 trim;, // x = start, y = end, z = offset

    void main() {,
        float opacityMod = 1.0;,
        
        // Dash
        if(dash.x > 0.0 && dash.y > 0.0) {,
            float dashEnd = dash.x + dash.y;,
            float lineUMod = mod(lineU.x + dash.z, dashEnd);,
            opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);,
        },
        
        // Trim
        if(trim.x > 0.0 || trim.y < 1.0) {,
            float a = mod(trim.x + trim.z, 1.0);,
            float b = mod(trim.y + trim.z, 1.0);,
            float per = lineU.x / lineU.y;,
            if(a < b) {,
                if(per < a || per > b) {,
                    opacityMod = 0.0;,
                },
            } else if(a > b) {,
                if(per < a && per > b) {,
                    opacityMod = 0.0;,
                },
            },
        },
        
        if(opacityMod == 0.0) {,
            discard;,
        },
        gl_FragColor = vec4(diffuse, opacity * opacityMod);,
    }
`;

function organizeList(list) {
    const order = ['stroke', 'fill', 'transform', 'trim', 'repeater'];
    let i, n, total = order.length, nTotal = list.length;
    var listOrder = [];
    for(i = 0; i < total; ++i) {
        let orderName = order[i];
        for(n = 0; n < nTotal; ++n) {
            let listName = list[n].type;
            if(orderName === listName) {
                listOrder.push(list[n]);
                break;
            }
        }
    }
    return listOrder;
}

function createPath(geometry, scalar) {
    const s = scalar ? window.devicePixelRatio : 1;
    var path = [];
    let i, total = geometry.vertices.length;
    for(i = 0; i < total; ++i) {
        path.push([ geometry.vertices[i].x * s, geometry.vertices[i].y * s ]);
    }
    return path;
}

module.exports = function(THREE) {
    var Line = require('three-line-2d')(THREE);
    
    function THREEStrokeMaterial(opt) {
        return new THREE.ShaderMaterial({
            uniforms: {
                thickness: {
                    type: 'f',
                    value: opt.thickness !== undefined ? opt.thickness : 4.0
                },
                opacity: {
                    type: 'f',
                    value: opt.opacity !== undefined ? opt.opacity : 1.0
                },
                diffuse: {
                    type: 'c',
                    value: new THREE.Color(opt.diffuse !== undefined ? opt.diffuse : 0xffffff)
                },
                dash: {
                    type: 'f',
                    value: opt.dash !== undefined ? opt.dash : new THREE.Vector3(0, 10, 0)
                },
                trim: {
                    type: 'f',
                    value: opt.trim !== undefined ? opt.trim : new THREE.Vector3(0, 1, 0)
                }
            },
            vertexShader: StrokeVertex,
            fragmentShader: StrokeFragment,
            side: opt.side !== undefined ? opt.side : THREE.DoubleSide,
            transparent: opt.transparent !== undefined ? opt.transparent : true
        });
    }
    
    class THREEShape extends THREELayer {
        constructor(json, timeline, renderer, camera) {
            super(json, timeline);
            
            this.mesh = new THREE.Object3D();
            this.item.add( this.mesh );
            
            // Create shape
            const s = window.devicePixelRatio;
            let parent = this.mesh;
            function createShape(content) {
                let i, totalC = content.length, material, n, nTotal, data;
                for(i = 0; i < totalC; ++i) {
                    let cLayer  = content[i];
                    let isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
                    if(isShape) {
                        
                        // Cycle through the content to find fill, stroke, and transform
                        let geometry, mesh, shape, fill, stroke, color, container, folder,
                        trim, repeater,
                        closed = true,
                        transform = {
                            opacity : 1,
                            anchor  : [0, 0, 0],
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale   : [1, 1, 1],
                            timeline: []
                        };
                        nTotal = cLayer.content.length;
                        data = organizeList(cLayer.content);
                        for(n = 0; n < nTotal; ++n) {
                            let nLayer = data[n];
                            switch(nLayer.type) {
                                case "fill":
                                    fill = {
                                        alpha: nLayer.value.opacity,
                                        color: nLayer.value.color
                                    };
                                break;
                                
                                case "stroke":
                                    stroke = {
                                        alpha : nLayer.value.opacity,
                                        color : nLayer.value.color,
                                        width : nLayer.value.width * s,
                                        dashes: nLayer.value.dashes
                                    };
                                break;
                                
                                case "transform":
                                    transform = nLayer;
                                break;
                                
                                case "trim":
                                    trim = nLayer;
                                break;
                                
                                case "repeater":
                                    repeater = nLayer;
                                break;
                            }
                        }
                        
                        /**
                         * Create Material / material effectors
                         */
                        
                        if(stroke !== undefined) {
                            color    = new THREE.Color( stroke.color[0], stroke.color[1], stroke.color[2] );
                            material = new THREEStrokeMaterial({
                                diffuse: color.getHex(),
                                opacity: stroke.alpha,
                                thickness: stroke.width
                            });
                            
                            /**
                             * Dashes
                             */
                            if(stroke.dashes !== undefined) {
                                material.uniforms.dash.value.x = stroke.dashes.dash * s;
                                material.uniforms.dash.value.y = stroke.dashes.gap  * s;
                                material.uniforms.dash.value.z = stroke.dashes.offset * s;
                                
                                // Animation
                                if(stroke.dashes.timeline !== undefined) {
                                    nTotal = stroke.dashes.timeline.length;
                                    for(n = 0; n < nTotal; ++n) {
                                        switch(stroke.dashes.timeline[n].name) {
                                            case "dash":
                                                THREELayer.animate(material.uniforms.dash.value, 'x', timeline, stroke.dashes.timeline[n], true);
                                            break;
                                            case "gap":
                                                THREELayer.animate(material.uniforms.dash.value, 'y', timeline, stroke.dashes.timeline[n], true);
                                            break;
                                            case "offset":
                                                THREELayer.animate(material.uniforms.dash.value, 'z', timeline, stroke.dashes.timeline[n], true);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            /**
                             * Trim
                             */
                            if(trim !== undefined) {
                                material.uniforms.trim.value.x = trim.value.start;
                                material.uniforms.trim.value.y = trim.value.end;
                                material.uniforms.trim.value.z = trim.value.offset;
                                
                                // Animation
                                nTotal = trim.timeline.length;
                                for(n = 0; n < nTotal; ++n) {
                                    switch(trim.timeline[n].name) {
                                        case "start":
                                            THREELayer.animate(material.uniforms.trim.value, 'x', timeline, trim.timeline[n]);
                                        break;
                                        case "end":
                                            THREELayer.animate(material.uniforms.trim.value, 'y', timeline, trim.timeline[n]);
                                        break;
                                        case "offset":
                                            THREELayer.animate(material.uniforms.trim.value, 'z', timeline, trim.timeline[n]);
                                        break;
                                    }
                                }
                            }
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
                        
                        /**
                         * Draw Shapes
                         */
                        
                        shape = new THREE.Shape();
                        
                        // Draw paths
                        nTotal = cLayer.paths.length;
                        
                        for(n = 0; n < nTotal; ++n) {
                            let angle, pt, pts, x, y, w, h, t, u, poly, totalPoints, curved, path = cLayer.paths[n];
                            closed = true;
                            switch(path.type) {
                                case "ellipse":
                                    x = path.x*s;
                                    y = path.y*s;
                                    w = (path.width /2)*s;
                                    h = (path.height/2)*s;
                                    shape.ellipse(x, y, w, h, 0, MathU.TWO_PI, true, Math.PI/2);
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
                                    curved = false;
                                    closed = path.closed;
                                    shape.moveTo( path.vertices[0][0]*s, path.vertices[0][1]*-s );
                                    for(u = 0; u < totalPoints; ++u) {
                                        if(  path.inTangents[u][0] !== 0 ||
                                             path.inTangents[u][1] !== 0 ||
                                            path.outTangents[u][0] !== 0 ||
                                            path.outTangents[u][1] !== 0) {
                                            curved = true;
                                            break;
                                        }
                                    }
                                    // console.log("CURVED?", curved, path.closed);
                                    if(curved) {
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
                                    } else {
                                        for(u = 0; u < totalPoints; ++u) {
                                            t = u+1;
                                            if(path.closed) t = t % totalPoints;
                                            else if(t >= totalPoints) break;
                                            shape.lineTo(
                                                path.vertices[t][0]*s,
                                                path.vertices[t][1]*-s
                                            );
                                        }
                                    }
                                    THREELayer.morph( shape, path, timeline, path.closed );
                                break;
                            }
                        }
                        
                        /**
                         * Create Mesh for shape
                         */
                        
                        container = new THREE.Object3D();
                        parent.add( container );
                        
                        if(stroke !== undefined) {
                            let geom = shape.createPointsGeometry(36);
                            let pts  = createPath(geom, false);
                            geometry = Line(pts, {
                                closed: closed,
                                distances: stroke.dashes !== undefined || trim !== undefined
                            });
                        } else {
                            geometry = new THREE.ShapeGeometry(shape);
                        }
                        
                        // if(repeater !== undefined) {
                        //     let tempMesh = new THREE.Mesh(geometry, material);
                        //     mesh = new RepeaterLayer(tempMesh, renderer);
                        //     // THREELayer.transform( container, mesh, transform, timeline );
                        // } else {
                        mesh = new THREE.Mesh(geometry, material);
                        THREELayer.transform( container, mesh, transform, timeline );
                        // }
                        // THREELayer.transform( container, mesh, transform, timeline );
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
            THREELayer.transform( this.item, this.mesh, json.transform, timeline )
        }
    }
    
    return THREEShape;
}