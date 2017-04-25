import DOMUtil  from 'apollo-utils/DOMUtil';
import MathUtil from 'apollo-utils/MathUtil';
import Keyframe from '../timeline/Keyframe';

const SVG = {
    animate: function(element, animations, timeline) {
        var i, n, nTotal, total = animations.length;
        for(i = 0; i < total; ++i) {
            var ani = animations[i];
            nTotal  = ani.keys.length;
            
            for(n = 0; n < nTotal; ++n) {
                var key      = ani.keys[n];
                var from     = [ key.value ];
                var target   = key.target;
                var delay    = key.start;
                var duration = key.duration;
                var x0       = key.x0;
                var y0       = key.y0;
                var x1       = key.x1;
                var y1       = key.y1;
                var ease     = [x0, y0, x1, y1];
                var keyframe = undefined;
                
                switch(ani.name) {
                    case "dash":
                        keyframe = new Keyframe( element, 'strokeDash', target, duration, delay, ease, from, undefined, undefined );
                    break;
                    case "gap":
                        keyframe = new Keyframe( element, 'strokeGap', target, duration, delay, ease, from, undefined, undefined );
                    break;
                    case "offset":
                        keyframe = new Keyframe( element, 'strokeOffset', target, duration, delay, ease, from, undefined, undefined );
                    break;
                    case "width":
                        keyframe = new Keyframe( element, 'strokeWidth', target, duration, delay, ease, from, undefined, undefined );
                    break;
                }
                
                if(keyframe !== undefined) {
                    keyframe.easeType = key.type;
                    timeline.addKeyframe( keyframe );
                }
            }
        }
    },
    
    morph: function(element, animations, style, timeline) {
        const me = this;
        var i, total, n, nTotal;
        total = animations.length;
        for(i = 0; i < total; ++i) {
            var ani = animations[i];
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
                var keyframe   = new Keyframe( data, 'value', 1, duration, delay, ease, undefined, undefined, function(percent, curved) {
                    var params  = {
                        vertices    : [],
                        inTangents  : [],
                        outTangents : [],
                    };
                    for(let s = 0; s < data.total; ++s) {
                        let t = s+1;
                        if(closed) t = t % data.total;
                        else if(t >= data.total) break;
                        
                        params.vertices.push( [
                            MathUtil.lerp(curved, data.vertsValue[t][0], data.vertsTarget[t][0]),
                            MathUtil.lerp(curved, data.vertsValue[t][1], data.vertsTarget[t][1])
                        ] );
                        
                        params.inTangents.push( [
                            MathUtil.lerp(curved, data.tanInValue[t][0], data.tanInTarget[t][0]),
                            MathUtil.lerp(curved, data.tanInValue[t][1], data.tanInTarget[t][1])
                        ] );
                        
                        params.outTangents.push( [
                            MathUtil.lerp(curved, data.tanOutValue[t][0], data.tanOutTarget[t][0]),
                            MathUtil.lerp(curved, data.tanOutValue[t][1], data.tanOutTarget[t][1])
                        ] );
                    }
                    var border  = me.getMaxBorder(style);
                    var svgPath = me.bezierToPath( params, undefined, border, border );
                    element.setAttribute("d", svgPath);
                    me.determineBounds(element, params, border);
                } );
                
                keyframe.easeType = key.type;
                timeline.addKeyframe( keyframe );
            }
        }
    },
    
    create: function() {
        var element = window.document.createElementNS('http://www.w3.org/2000/svg', "svg");
        return element;
    },
    
    addPath: function(svg, vertices, pointsIn, pointsOut) {
        var path = document.createElementNS('http://www.w3.org/2000/svg','path');
        svg.appendChild( path );
    },
    
    applyMasks: function(element, masks) {
        if( masks.length > 0 ) {
            var maskURL = "url(#" + masks.join(" ") + ")";
            element.setAttribute("clip-path", maskURL);
        }
    },
    
    createMasks: function(element, json) {
        var masks = [];
        if( json.masks !== undefined ) {
            var i, total = json.masks.length, n, nTotal;
            for(i = 0; i < total; ++i) {
                var mask = json.masks[i];
                var path = this.bezierToPath( mask, true );
                var defs = this.getDefs( element );
                if(defs === undefined) {
                    defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
                    element.appendChild( defs );
                }
                
                var lMask = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
                lMask["id"] = mask.name;
                defs.appendChild(lMask);
                masks.push(mask.name);
                
                var lPath = document.createElementNS('http://www.w3.org/2000/svg','path');
                lPath.setAttribute("d", path);
                lMask.appendChild(lPath);
            }
        }
        return masks;
    },
    
    circle: function( params, style, parent, timeline ) {
        var element = document.createElementNS('http://www.w3.org/2000/svg','circle');
        var border  = this.getMaxBorder(style);
        
        this.setup( element, style );
        
        element.x          = params.x + border;
        element.y          = params.y + border;
        element.radius     = params.width;
        
        if( style.timeline.length > 0 && timeline !== undefined ) {
            this.animate( element, style.timeline, timeline );
        }
        
        if(parent !== undefined) {
            var wid = params.x + params.width  + (border*2);
            var hei = params.y + params.height + (border*2);
            if(wid > parent.width ) parent.width  = wid;
            if(hei > parent.height) parent.height = hei;
        }
        
        return element;
    },
    
    ellipse: function( params, style, parent, timeline ) {
        var element = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
        var border  = this.getMaxBorder(style);
        
        this.setup( element, style );
        
        element.x           = (params.width  / 2) + params.x + border;
        element.y           = (params.height / 2) + params.y + border;
        element.width       = params.width;
        element.height      = params.height;
        
        if( style.timeline.length > 0 && timeline !== undefined ) {
            this.animate( element, style.timeline, timeline );
        }
        
        if(parent !== undefined) {
            var wid = params.x + params.width  + (border*2);
            var hei = params.y + params.height + (border*2);
            if(wid > parent.width ) parent.width  = wid;
            if(hei > parent.height) parent.height = hei;
        }
        
        return element;
    },
    
    rectangle: function( params, style, parent, timeline ) {
        var element = document.createElementNS('http://www.w3.org/2000/svg','rect');
        var border  = this.getMaxBorder(style);
        
        this.setup( element, style );
        
        element.x           = params.x + (border/2);
        element.y           = params.y + (border/2);
        element.width       = params.width;
        element.height      = params.height;
        element.roundness   = params.roundness;
        
        if( style.timeline.length > 0 && timeline !== undefined ) {
            this.animate( element, style.timeline, timeline );
        }
        
        if(parent !== undefined) {
            var wid = params.x + params.width  + border;
            var hei = params.y + params.height + border;
            if(wid > parent.width ) parent.width  = wid;
            if(hei > parent.height) parent.height = hei;
        }
        
        return element;
    },
    
    determineBounds: function(element, params, border) {
        var x = 100000000;
        var y = 100000000;
        var width  = 0;
        var height = 0;
        
        var vertices    = params.vertices;
        var inTangents  = params.inTangents;
        var outTangents = params.outTangents;
        var i, total = vertices.length;
        for(i = 0; i < total; ++i) {
            var _x = vertices[i][0] + outTangents[i][0];
            var _y = vertices[i][1] + outTangents[i][1];
            if(_x < x) x = _x;
            if(_y < y) y = _y;
        }
        
        for(i = 0; i < total; ++i) {
            var _w = vertices[i][0] + inTangents[i][0] - x;
            var _h = vertices[i][1] + inTangents[i][1] - y;
            if(_w >  width) width  = _w;
            if(_h > height) height = _h;
        }
        
        element.x = x + border;
        element.y = y + border;
        element.width  = width;
        element.height = height;
    },
    
    shape: function( params, style, parent, timeline ) {
        var element = document.createElementNS('http://www.w3.org/2000/svg','path');
        var border  = this.getMaxBorder(style);
        var svgPath = this.bezierToPath( params, undefined, border, border );
        element.setAttribute("d", svgPath);
        this.setup( element, style );
        this.determineBounds(element, params, border);
        
        if( timeline !== undefined ) {
            if( style.timeline.length > 0 ) {
                this.animate( element, style.timeline, timeline );
            } else if( params.timeline.length > 0 ) {
                this.morph( element, params.timeline, style, timeline );
            }
        }
        
        if(parent !== undefined) {
            var wid = element.x + element.width  + (border*2);
            var hei = element.y + element.height + (border*2);
            if(wid > parent.width ) parent.width  = wid;
            if(hei > parent.height) parent.height = hei;
        }
        
        return element;
    },
    
    setup: function(obj, style) {
        this.extend( obj );
        
        if(style.fill !== undefined) {
            obj.fill = style.fill;
            if(style.fillAlpha  !== undefined) obj.fillAlpha = style.fillAlpha;
        }
        
        if(style.stroke !== undefined) {
            obj.stroke       = style.stroke;
            obj.strokeAlpha  = style.strokeAlpha;
            obj.strokeCap    = style.strokeCap;
            obj.strokeCorner = style.strokeCorner;
            obj.strokeWidth  = style.strokeWidth;
            
            if(style.strokeDashes !== undefined) {
                obj.strokeDash   = style.strokeDashes.dash;
                obj.strokeGap    = style.strokeDashes.gap;
                obj.strokeOffset = style.strokeDashes.offset;
            }
        }
    },
    
    extend: function(element) {
        var style = {
            fill        : "none",
            fillR       : -1,
            fillG       : -1,
            fillB       : -1,
            fillA       : 1,
            stroke      : "none",
            strokeCap   : "butt",
            strokeCorner: "miter",
            strokeDash  : {
                dash  : 0,
                gap   : 0,
                offset: 0
            },
            strokeR     : -1,
            strokeG     : -1,
            strokeB     : -1,
            strokeA     : 1,
            strokeWidth : 1
        };
        
        //////////////////////////////////////////////////
        // Basic Style
        
        Object.defineProperty(element, "fill", {
            get: function() {
                return style.fill;
            },
            set: function(value) {
                style.fill  = value;
                var rgb     = DOMUtil.cssToHex( style.fill );
                style.fillR = rgb[0];
                style.fillG = rgb[1];
                style.fillB = rgb[2];
                this.setAttribute("fill", value);
            }
        });
        
        Object.defineProperty(element, "fillAlpha", {
            get: function() {
                return style.fillAlpha;
            },
            set: function(value) {
                style.fillAlpha = value;
                this.setAttribute("fill-opacity", value);
            }
        });
        
        Object.defineProperty(element, "stroke", {
            get: function() {
                return style.stroke;
            },
            set: function(value) {
                style.stroke = value;
                this.setAttribute("stroke", value);
            }
        });
        
        Object.defineProperty(element, "strokeCap", {
            get: function() {
                return style.strokeCap;
            },
            set: function(value) {
                style.strokeCap = value;
                this.setAttribute("stroke-linecap", value);
            }
        });
        
        Object.defineProperty(element, "strokeCorner", {
            get: function() {
                return style.strokeCorner;
            },
            set: function(value) {
                style.strokeCorner = value;
                this.setAttribute("stroke-linejoin", value);
            }
        });
        
        // Dashes
        
        Object.defineProperty(element, "strokeDash", {
            get: function() {
                return style.strokeDash.dash;
            },
            set: function(value) {
                style.strokeDash.dash = value;
                this.setAttribute("stroke-dasharray", style.strokeDash.dash.toString()+", "+style.strokeDash.gap.toString());
            }
        });
        
        Object.defineProperty(element, "strokeGap", {
            get: function() {
                return style.strokeDash.gap;
            },
            set: function(value) {
                style.strokeDash.gap = value;
                this.setAttribute("stroke-dasharray", style.strokeDash.dash.toString()+", "+style.strokeDash.gap.toString());
            }
        });
        
        Object.defineProperty(element, "strokeOffset", {
            get: function() {
                return style.strokeDash.offset;
            },
            set: function(value) {
                style.strokeDash.offset = value;
                this.setAttribute("stroke-dashoffset", style.strokeDash.offset);
            }
        });
        
        Object.defineProperty(element, "strokeAlpha", {
            get: function() {
                return style.strokeAlpha;
            },
            set: function(value) {
                style.strokeAlpha = value;
                this.setAttribute("stroke-opacity", value);
            }
        });
        
        Object.defineProperty(element, "strokeWidth", {
            get: function() {
                return style.strokeWidth;
            },
            set: function(value) {
                style.strokeWidth = value;
                this.setAttribute("stroke-width", value);
            }
        });
        
        //////////////////////////////////////////////////
        // Update defaults
        
        if( element.getAttribute("fill") ) {
            element.fill = element.getAttribute("fill");
        }
        if( element.getAttribute("fill-opacity") )      element.fillAlpha       = element.getAttribute("fill-opacity");
        if( element.getAttribute("stroke") ) {
            style.stroke = element.getAttribute("stroke");
        }
        if( element.getAttribute("stroke-linecap") )    element.strokeCap       = element.getAttribute("stroke-linecap");
        if( element.getAttribute("stroke-linejoin") )   element.strokeCorner    = element.getAttribute("stroke-linejoin");
        if( element.getAttribute("stroke-opacity") )    element.strokeAlpha     = Number( element.getAttribute("stroke-opacity") );
        if( element.getAttribute("stroke-width") )      element.strokeWidth     = Number( element.getAttribute("stroke-width") );
        if( element.getAttribute("stroke-dashoffset") ) element.strokeOffset    = Number( element.getAttribute("stroke-dashoffset") );
        if( element.getAttribute("stroke-dasharray") ) {
            var dash = element.getAttribute("stroke-dasharray").split(", ");
            element.strokeDash = Number( dash[0] );
            element.strokeGap  = Number( dash[1] );
        }
        
        //////////////////////////////////////////////////
        // Shape
        
        var transform = {
            x        : 0,
            y        : 0,
            width    : 0,
            height   : 0,
            roundness: 0
        };
        
        switch(element.tagName) {
            case "rect":
                this.extendRect( element, transform );
            break;
            case "circle":
                this.extendCircle( element, transform );
            break;
            case "ellipse":
                this.extendEllipse( element, transform );
            break;
            case "path":
                this.extendPath( element );
            break;
            case "polygon":
            break;
            case "polystar":
            break;
        }
        
        return element;
    },
    
    extendRect: function(element, transform) {
        if( element.getAttribute("x") )      transform.x         = Number( element.getAttribute("x") );
        if( element.getAttribute("y") )      transform.y         = Number( element.getAttribute("y") );
        if( element.getAttribute("width") )  transform.width     = Number( element.getAttribute("width") );
        if( element.getAttribute("height") ) transform.height    = Number( element.getAttribute("height") );
        if( element.getAttribute("rx") )     transform.roundness = Number( element.getAttribute("rx") );
        
        Object.defineProperty(element, "x", {
            get: function() {
                return transform.x;
            },
            set: function(value) {
                transform.x = value;
                this.setAttribute("x", value);
            }
        });
        
        Object.defineProperty(element, "y", {
            get: function() {
                return transform.x;
            },
            set: function(value) {
                transform.y = value;
                this.setAttribute("y", value);
            }
        });
        
        Object.defineProperty(element, "width", {
            get: function() {
                return transform.width;
            },
            set: function(value) {
                transform.width = value;
                this.setAttribute("width", value);
            }
        });
        
        Object.defineProperty(element, "height", {
            get: function() {
                return transform.height;
            },
            set: function(value) {
                transform.height = value;
                this.setAttribute("height", value);
            }
        });
        
        Object.defineProperty(element, "roundness", {
            get: function() {
                return transform.roundness;
            },
            set: function(value) {
                transform.roundness = value;
                this.setAttribute("rx", value);
                this.setAttribute("ry", value);
            }
        });
    },
    
    extendCircle: function(element, transform) {
        if( element.getAttribute("cx") )     transform.x = Number( element.getAttribute("x") );
        if( element.getAttribute("cy") )     transform.y = Number( element.getAttribute("y") );
        if( element.getAttribute("r") ) {
            transform.width = transform.height = Number( element.getAttribute("r") );
        }
        
        Object.defineProperty(element, "x", {
            get: function() {
                return transform.x;
            },
            set: function(value) {
                transform.x = value;
                this.setAttribute("cx", value);
            }
        });
        
        Object.defineProperty(element, "y", {
            get: function() {
                return transform.y;
            },
            set: function(value) {
                transform.y = value;
                this.setAttribute("cy", value);
            }
        });
        
        Object.defineProperty(element, "radius", {
            get: function() {
                return transform.width;
            },
            set: function(value) {
                transform.width  = value;
                transform.height = value;
                this.setAttribute("r", value);
            }
        });
    },
    
    extendEllipse: function(element, transform) {
        if( element.getAttribute("cx") )     transform.x = Number( element.getAttribute("x") );
        if( element.getAttribute("cy") )     transform.y = Number( element.getAttribute("y") );
        if( element.getAttribute("rx") )     transform.width  = Number( element.getAttribute("rx") );
        if( element.getAttribute("ry") )     transform.height = Number( element.getAttribute("ry") );
        
        Object.defineProperty(element, "x", {
            get: function() {
                return transform.x;
            },
            set: function(value) {
                transform.x = value;
                this.setAttribute("cx", value);
            }
        });
        
        Object.defineProperty(element, "y", {
            get: function() {
                return transform.y;
            },
            set: function(value) {
                transform.y = value;
                this.setAttribute("cy", value);
            }
        });
        
        Object.defineProperty(element, "width", {
            get: function() {
                return transform.width;
            },
            set: function(value) {
                transform.width = value;
                this.setAttribute("rx", value/2);
            }
        });
        
        Object.defineProperty(element, "height", {
            get: function() {
                return transform.height;
            },
            set: function(value) {
                transform.height = value;
                this.setAttribute("ry", value/2);
            }
        });
    },
    
    extendPath: function(element) {
        element.straightPath    = true;
        if(element.getAttribute("d") !== undefined) {
            element.straightPath = element.getAttribute("d").match(/[C|c|S|s]/g) ? false : true;
        }
        element.points          = this.pathToPoints( element );
        element.originals       = element.points.slice();
        element.segments        = MathUtil.bezierPathDistance( element.points[0] );
        element._startPercent   = 0;
        element._endPercent     = 1;
        element._offsetPercent  = 0;
        var lastUpdate = Date.now();
        var SVG = this;
        
        Object.defineProperty(element, "firstPath", {
            set : function (x){
                this.points[0] = x;
            },
            get : function () {
                if (!this.points) {
                    if(this.getAttribute("d") !== undefined){
                        this.points = SVG.pathToPoints( this.getAttribute("d"), this.straightPath );
                    } else {
                        this.points = [[]];
                    }
                }
                return this.points[0];
            }
        });
        
        Object.defineProperty(element, "startPercent", {
            get: function() {
                return this._startPercent;
            },
            set: function(value) {
                this._startPercent = value;
                this.updatePath();
            }
        });
        
        Object.defineProperty(element, "endPercent", {
            get: function() {
                return this._endPercent;
            },
            set: function(value) {
                this._endPercent = value;
                this.updatePath();
            }
        });
        
        Object.defineProperty(element, "offsetPercent", {
            get: function() {
                return this._offsetPercent;
            },
            set: function(value) {
                this._offsetPercent = value;
                this.updatePath();
            }
        });
        
        element.pointAt = function(percentage) {
            return MathUtil.getPointInPath( element.points[0], element.segments, percentage );
        };
        
        element.updatePathBetween = function (start, end) {
            this.refPath   = this.refPath || this.firstPath;
            this.firstPath = this.refPath.slice();
            
            if(!this.segments) {
                this.segments = MathUtil.bezierPathDistance( this.points[0] );
            }
            
            const precision = 3;
            
            var seg  = this.segments.slice();
            var info = new Object();
            var forceMiddle = null;
            
            var normalStart = MathUtil.roundTo( start, precision );
            var normalEnd   = MathUtil.roundTo( end, precision );

            if (normalStart>normalEnd) {
                var middle = MathUtil.lerpArray(0.5, normalStart, 1.0+normalEnd);
                middle = MathUtil.roundTo( middle-Math.floor(middle), precision );

                if (middle>=start && middle<=end) {
                    forceMiddle = middle;
                }
            }

            if (this._startPercent>0 || this._endPercent<1) {
                this.firstPath = MathUtil.getPathBetween(start,end, this.firstPath,seg, info, forceMiddle);
            }

            return [this.firstPath];
        };
        
        element.updatePath = function() {
            var pathToUse = this.originals;
            var offP   = this._offsetPercent;
            var startP = this._startPercent+offP;
            var endP   = this._endPercent  +offP;
            if(startP > 1 || startP < 0) startP %= 1;
            if(endP > 1 || endP < 0) endP %= 1;
            
            // console.log(startP.toFixed(3), endP.toFixed(3));
            
            if(startP === endP) {
                this.setAttribute("d", "");
                return;
            }
            
            // if( MathUtil.roundTo(this._startPercent, 3) === 0.0 && MathUtil.roundTo(this._endPercent, 3) === 1.0) {
            //     console.log('a');
            //     startP = 0.0;
            //     endP   = 1.0;
            // }
            
            if (endP === 0 && this._endPercent !== 0) {
                endP = 1.0;
            }

            if(startP>0 || endP<1) {
                if (startP>endP) {
                    pathToUse = this.updatePathBetween(startP, 1);
                    var string = SVG.arrayToSVGPath(pathToUse, this.straightPath);
                    pathToUse = this.updatePathBetween(0, endP);
                    var string2 = SVG.arrayToSVGPath(pathToUse, this.straightPath);
                    this.setAttribute("d", string+string2);
                } else {
                    pathToUse = this.updatePathBetween(startP, endP);
                    var string = SVG.arrayToSVGPath(pathToUse, this.straightPath);
                    this.setAttribute("d", string);
                }
            // } else {
            //     console.log('d', startP, endP);
            //     pathToUse = this.updatePathBetween(0, 1);
            //     this.setAttribute("d", SVG.arrayToSVGPath(pathToUse, this.straightPath));
            }
        };
    },
    
    //////////////////////////////////////////////////
    // SVG manipulation
    
    getMaxBorder: function(style) {
        var border = style.strokeWidth !== undefined ? (style.strokeWidth/2) : 0;
        
        if(style.timeline.length > 0) {
            var i, total = style.timeline.length;
            for(i = 0; i < total; ++i) {
                var ani = style.timeline[i];
                if(ani.name === "width") {
                    var n, nTotal = ani.keys.length;
                    for(n = 0; n < nTotal; ++n) {
                        var key = ani.keys[n];
                        if(     key.target > border) border = key.target;
                        else if(key.value > border) border = key.value;
                    }
                    return border;
                }
            }
        }
        
        return border;
    },
    
    addCurveForLine: function(array, oldPoint, newPoint, straightPath) {
        array.push( MathUtil.lerpArray(0.01, oldPoint, newPoint) );
        array.push( MathUtil.lerpArray(0.99, oldPoint, newPoint) );
        array.push(newPoint);
    },
    
    addPointToArray: function(array, numbers, order, straightPath) {
        var lastPoint = [0, 0];
        if (array.length>0) {
            lastPoint = array[array.length-1];
        }
        switch (order) {
            case "M":
                array.push([numbers[0],numbers[1]]);
                break;
            case "c":
                this.pushNumbersForCurve(array,numbers,lastPoint);
                break;
            case "C":
                this.pushNumbersForCurve(array,numbers,[0.0,0.0]);
                break;
            case "h":
                this.addCurveForLine(array, lastPoint, [lastPoint[0]+numbers[0], lastPoint[1]],straightPath);
                break;
            case "H":
                this.addCurveForLine(array, lastPoint, [numbers[0], lastPoint[1]],straightPath);
                break;
            case "v":
                this.addCurveForLine(array, lastPoint, [lastPoint[0], lastPoint[1]+numbers[0]],straightPath);
                break;
            case "V":
                this.addCurveForLine(array, lastPoint, [lastPoint[0], numbers[0]],straightPath);
                break;
            case "l":
                this.addCurveForLine(array, lastPoint, MathUtil.add(lastPoint, numbers),straightPath);
                break;
            case "L":
                this.addCurveForLine(array, lastPoint, numbers,straightPath);
                break;
            case "S":
            {
                var pointBeforeLast = array[array.length-2];
                var vector = MathUtil.subArray(lastPoint, pointBeforeLast);
                var nPoint = MathUtil.addArray(lastPoint, vector);
                array.push(nPoint);
                array.push([numbers[0], numbers[1]]);
                array.push([numbers[2], numbers[3]]);
            }
                break;
            case "s" :
            {
                var pointBeforeLast = array[array.length-2];
                var vector = MathUtil.subArray(lastPoint, pointBeforeLast);
                var nPoint = MathUtil.addArray(lastPoint, vector);

                array.push(nPoint);
                array.push([lastPoint[0]+numbers[0], lastPoint[1]+numbers[1]]);
                array.push([lastPoint[0]+numbers[2], lastPoint[1]+numbers[3]]);
            }
                break;

            default :
                console.log("ORDER UNKNOWN :", order);
        }
    },
    
    arrayToSVGString: function(array, straightPath) {
        var string = "M"+(Math.floor(array[0][0]*10.0)/10.0)+","+(Math.floor(array[0][1]*10.0)/10.0).toString();
        
        if (straightPath) {
            for (var i = 1, length = array.length; i<length; i++) {
                string += "L"+(Math.floor(array[i][0]*10.0)/10.0);
                if (array[i][1]>=0) {
                    string +=",";
                }
                string += (Math.floor(array[i][1]*10.0)/10.0).toString();
            }
        } else {
            for (var i = 1, length = array.length; i<length; i+=3) {
                string += "C"+(Math.floor(array[i][0]*10.0)/10.0)+","+(Math.floor(array[i][1]*10.0)/10.0);

                for (var j = i+1; j<i+3; j++) {
                    string += ","+(Math.floor(array[j][0]*10.0)/10.0).toString()+","+(Math.floor(array[j][1]*10.0)/10.0).toString();
                }
            }
        }
        
        return string;
    },
    
    arrayToSVGPath: function(array, straightPath) {
        var returnString = [];
        for (var i = 0, len = array.length; i<len; i++) {
            returnString += this.arrayToSVGString(array[i], straightPath);
        }
        return returnString;
    },
    
    arrayToSVGPoints: function(array) {
        var string = "";
        for (var i = 0, length = array.length; i<length; i++) {
            string += array[i][0].toString()+","+array[i][1].toString()+" ";
        }
        return string;
    },
    
    bezierToPath: function(path, closed, offX, offY) {
        var vertices    = path.vertices;
        var inTangents  = path.inTangents;
        var outTangents = path.outTangents;
        var ox = offX !== undefined ? offX : 0;
        var oy = offY !== undefined ? offY : 0;

        var svg = "M";
        svg += MathUtil.roundTo(vertices[0][0] + ox, 1).toString() + "," + MathUtil.roundTo(vertices[0][1] + oy, 1).toString();
        var n, k, VN, IN, ON, VK, IK, OK, x, y, XN, YN, XK, YK, XB, YB, noCurve, total = vertices.length-1, iTotal = total-1;
        
        for(n = 0; n < total; ++n) {
            k = n+1;
            
            VN = vertices[n];
            IN = inTangents[n];
            ON = outTangents[n];
            VK = vertices[k];
            IK = inTangents[k];
            OK = outTangents[k];
            
            XN = MathUtil.roundTo(VN[0] + ON[0] + ox, 1);
            YN = MathUtil.roundTo(VN[1] + ON[1] + oy, 1);
            
            XB = MathUtil.roundTo(VK[0] + ox, 1);
            YB = MathUtil.roundTo(VK[1] + oy, 1);
            
            XK = MathUtil.roundTo(XB + IK[0], 1);
            YK = MathUtil.roundTo(YB + IK[1], 1);
            
            noCurve = IN[0] === 0 && IN[1] === 0 && ON[0] === 0 && ON[1] === 0;
            noCurve = noCurve || (XB === XK && YB === YK);
            
            if( noCurve ) {
                // Line
                svg += "L";
                svg += XK.toString() + "," + YK.toString();
                if(n < iTotal) svg += ",";
            } else {
                // Curve
                svg += "C";
                svg += XN.toString() + "," + YN.toString() + ",";
                svg += XK.toString() + "," + YK.toString() + ",";
                svg += XB.toString() + "," + YB.toString();
            }
        }
        
        if(path.closed === true || closed === true) {
            n = total;
            k = 0;
            
            VN = vertices[n];
            IN = inTangents[n];
            ON = outTangents[n];
            VK = vertices[k];
            IK = inTangents[k];
            OK = outTangents[k];
            
            if( IN[0] === 0 && IN[1] === 0 && ON[0] === 0 && ON[1] === 0 ) {
                // Line
                svg += "L";
                svg += MathUtil.roundTo(VN[0] + ox, 1).toString() + "," + MathUtil.roundTo(VN[1] + oy, 1).toString() + ",";
                svg += "Z";
            } else {
                // Curve
                svg += "C";
                svg += MathUtil.roundTo(VN[0] + ON[0] + ox, 1).toString() + "," + MathUtil.roundTo(VN[1] + ON[1] + oy, 1).toString() + ",";
                
                svg += MathUtil.roundTo(VK[0] + IK[0] + ox, 1).toString() + "," + MathUtil.roundTo(VK[1] + IK[1] + oy, 1).toString() + ",";
                svg += MathUtil.roundTo(VK[0] + ox).toString() + "," + MathUtil.roundTo(VK[1] + oy).toString();
            }
        }
        
        return svg;
    },
    
    pathToPoints: function(element) {
        var path = element.getAttribute("d");
        var straightPath = path !== undefined ? (path.match(/[C|c|S|s]/g) ? false : true) : false;
        var order = path.match(/([a-z]|[A-Z])/g);
        var numbers = path.match(/([^a-zA-Z]+)/g);
        var array = [];
        var currentSVG = [];
        array.push(currentSVG);
        for (var i = 0, length = numbers.length; i<length; i++) {
            var s = numbers[i];
            var subString = s.match(/\-?[0-9|\.]+/g);

            if (subString) {
                for (var j = 0, nLength = subString.length; j<nLength; j++) {
                    subString[j] = parseFloat(subString[j]);
                }
                this.addPointToArray(currentSVG,subString,order[i],straightPath);
            } else {
                currentSVG = [];
                array.push(currentSVG);
            }

        }
        return array;
    },
    
    pointsToArray: function(path) {
        var numbers = path.match(/\-?[0-9|\.]+/g);
        var array = [];
        for (var i = 0, length = numbers.length; i<length; i+=2) {
            array.push([parseFloat(numbers[i]),parseFloat(numbers[i+1])]);
        }
        return array;
    },
    
    pushNumbersForCurve: function(array, numbers, anchor) {
        for (var i = 0, length = numbers.length; i<length; i+=2) {
            array.push( MathUtil.addArray(anchor, [numbers[i],numbers[i+1]]) );
        }
    },
    
    getDefs: function(svg) {
        var i, totalLayers = svg.children.length;
        for(i = 0; i < totalLayers; ++i) {
            var l = svg.children[i];
            if(l.tagName === "defs") return l
        }
        return undefined;
    }
};

export default SVG;
