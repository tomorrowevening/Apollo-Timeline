var PIXI        = require('pixi.js');
var MathU       = require('apollo-utils/MathUtil');
var Loader      = require('apollo-utils/Loader');
var Composition = require('apollo-timeline/Composition');
var PIXILayer   = require('./PIXILayer').PIXILayer;
var PIXIImage   = require('./PIXILayer').PIXIImage;
var PIXIShape   = require('./PIXILayer').PIXIShape;
var PIXIText    = require('./PIXILayer').PIXIText;

function PIXIComposition(json, renderer) {
    Composition.call(this, json)
    
    this.renderer   = renderer;
    this.item       = new PIXI.Container();
    
    if(json.transform !== undefined) {
        var scale            = window.devicePixelRatio;
        this.item.alpha      = json.transform.opacity;
        this.item.pivot.x    = json.transform.anchor[0]*scale;
        this.item.pivot.y    = json.transform.anchor[1]*scale;
        this.item.position.x = json.transform.position[0]*scale;
        this.item.position.y = json.transform.position[1]*scale;
        this.item.rotation   = MathU.toRad(json.transform.rotation[2]);
        this.item.scale.x    = json.transform.scale[0];
        this.item.scale.y    = json.transform.scale[1];
    }
    
    this.dispose = function() {
        if(this.item.parent !== undefined) {
            this.item.parent.removeChild( this.item );
            delete this.item;
        }
        this.timeline.dispose();
        this.camera = undefined;
        this.layers = [];
    }
    
    this.buildLayerComposition = function(json) {
        let cJSON = Loader.json.project.compositions[json.name];
        let atlas = Loader.json.atlas.compositions[ json.name ];
        let layer = new PIXIComposition( json, this.renderer );
        layer.build( cJSON, this );
        layer.buildAtlas(atlas);
        this.item.addChild( layer.item );
        return layer;
    }
    
    this.buildLayerImage = function(json) {
        let layer = new PIXIImage( json, this.timeline );
        this.item.addChild( layer.item );
        return layer;
    }
    
    this.buildLayerShape = function(json) {
        let layer = new PIXIShape( json, this.timeline );
        this.item.addChild( layer.item );
        return layer;
    }
    
    this.buildLayerText = function(json) {
        let layer = new PIXIText( json, this.timeline );
        this.item.addChild( layer.item );
        return layer;
    }
    
    this.updateLayers = function() {
        var time  = this.timeline.seconds;
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            var s = l.isShowing(time);
            l.item.visible = s;
            if(s) {
                var t = time - l.start;
                if( l instanceof Composition && !l.showing ) {
                    l.show();
                }
                l.update( t );
            } else if(l.showing) {
                l.showing = false;
                if( l instanceof Composition ) {
                    l.hide();
                }
            }
        }
    }
    
    if(json.transform !== undefined) {
        PIXILayer.transform( this.item, json.transform, this.timeline );
        PIXILayer.createMasks( this.item, json.masks, this.timeline );
    }
}
PIXIComposition.prototype = Object.create( Composition.prototype );
PIXIComposition.prototype.constructor = PIXIComposition;

module.exports = PIXIComposition;
