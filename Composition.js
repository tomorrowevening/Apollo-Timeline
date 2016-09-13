var DOM         = require('apollo-utils/DOMUtil');
var MathU       = require('apollo-utils/MathUtil');
var Event       = require('apollo-utils/Event');
var Timeline    = require('./Timeline');
var Marker      = require('./Marker');
var Layer       = require('./Layer').Layer;
var LayerAudio  = require('./Layer').LayerAudio;
var LayerImage  = require('./Layer').LayerImage;
var LayerShape  = require('./Layer').LayerShape;
var LayerText   = require('./Layer').LayerText;

function Composition( obj ) {
    Layer.call(this, obj);
    
    this.background = {
        r   : 0,
        g   : 0,
        b   : 0,
        hex : "0x000000"
    };
    this.width      = 0;
    this.height     = 0;
    this.camera     = undefined;
    this.layers     = [];
    this.timeline   = new Timeline();
    
    this.dispose = function() {
        this.timeline.dispose();
        this.camera     = undefined;
        this.layers     = [];
    }
    
    this.update = function( time ) {
        if(!this.timeline.playing) return false;
        this.updateLayers();
    }
    
    this.draw = function() {
        // Draw background
        
        
        // Draw layers
        this.drawLayers();
    }
    
    this.updateHandler = function() {
        this.update();
    }
    
    this.show = function() {
        this.showing = true;
        this.timeline.restart();
        this.timeline.play();
    }
    
    this.hide = function() {
        this.showing = false;
        this.timeline.pause();
    }
    
    this.build = function(json, parentComp) {
        var name                = json.name;
        var r                   = Math.round( json.bg[0]*255 );
        var g                   = Math.round( json.bg[1]*255 );
        var b                   = Math.round( json.bg[2]*255 );
        this.name               = json.name;
        this.width              = json.width;
        this.height             = json.height;
        this.background.r       = r;
        this.background.g       = g;
        this.background.b       = b;
        this.background.hex     = DOM.rgbToHex( r, g, b );
        this.timeline.name      = json.name;
        this.timeline.duration  = json.duration;
        if(parentComp !== undefined) this.duration = this.timeline.duration = Math.min( this.duration, parentComp.duration );
        
        var i, total;
        
        this.timeline.onPause   = this.pauseLayers.bind(this);
        this.timeline.onPlay    = this.playLayers.bind(this);
        
        // Build markers
        total = json.markers.length;
        for(i = 0; i < total; ++i) {
            var m = json.markers[i];
            this.timeline.markers.push( new Marker( m.name, m.time, m.action ) );
        }
        
        // Build layers
        total = json.layers.length;
        for(i = total-1; i > -1; --i) {
        // for(i = 0; i < total; ++i) {
            var layer = this.buildLayer( json.layers[i] );
            if(layer !== undefined) this.layers.push( layer );
        }
    }
    
    this.buildAtlas = function(atlas) {
        if(atlas === undefined) return;
        
        if(atlas.settings !== undefined) {
            // Mode
            if(atlas.settings.playMode !== undefined) {
                this.timeline.playMode = atlas.settings.playMode;
            }
            
            // Count
            if(atlas.settings.playCount !== undefined) {
                this.timeline.maxPlays = atlas.settings.playCount;
            }
        }
    }
    
    this.buildLayer = function(json) {
        var layer = new Layer( json.name, json.start, json.duration );
        
        // Create layer...
        switch(json.type) {
            case "audio":
                layer = this.buildLayerAudio( json );
            break;
            case "composition":
                layer = this.buildLayerComposition( json );
            break;
            case "image":
                layer = this.buildLayerImage( json );
            break;
            case "shape":
                layer = this.buildLayerShape( json );
            break;
            case "text":
                layer = this.buildLayerText( json );
            break;
        }
        
        return layer;
    }
    
    this.buildLayerAudio = function(json) {
        var layer = new LayerAudio( json );
        return layer;
    }
    
    this.buildLayerComposition = function(json) {
        var layer = new Composition( json );
        layer.build( json, this );
        return layer;
    }
    
    this.buildLayerImage = function(json) {
        var layer = new LayerImage( json );
        return layer;
    }
    
    this.buildLayerShape = function(json) {
        var layer = new LayerShape( json );
        return layer;
    }
    
    this.buildLayerText = function(json) {
        var layer = new LayerText( json );
        return layer;
    }
    
    //////////////////////////////////////////////////
    // Animation
    
    this.goTo = function(time, pause) {
        this.timeline.goTo(time, pause);
    }
    
    this.goToMarker = function(name) {
        return this.timeline.goToMarker(name);
    }
    
    this.updateLayers = function() {
        var time  = this.timeline.seconds;
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if(l.isShowing(time)) {
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
    
    this.drawLayers = function() {
        var time  = this.timeline.seconds;
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if(l.isShowing(time)) l.draw();
        }
    }
    
    this.play = function() {
        this.timeline.play();
    }
    
    this.pause = function() {
        this.timeline.pause();
    }
    
    this.playLayers = function() {
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if( l instanceof Composition ) l.play();
        }
    }
    
    this.pauseLayers = function() {
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if( l instanceof Composition ) l.pause();
        }
    }
    
    //////////////////////////////////////////////////
    // Getters
    
    this.getMarker = function(name) {
        return this.timeline.getMarker(name);
    }
    
    Object.defineProperty(this, "playing", {
        get: function() {
            return this.timeline.playing;
        }
    });
    
    //////////////////////////////////////////////////
    // Setters
    
    this.setTime = function(value) {
        this.timeline.setTime(value);
        //
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if( l instanceof Composition ) {
                l.setTime(value);
            }
        }
    }
    
    this.setPlaymode = function(value) {
        this.timeline.playMode = value;
        //
        var total = this.layers.length;
        for(var i = 0; i < total; ++i) {
            var l = this.layers[i];
            if( l instanceof Composition ) {
                l.timeline.playMode = value;
            }
        }
    }
    
    this.timeline.listen(Event.UPDATE, this.updateHandler.bind(this));
}
Composition.prototype = Object.create( Layer.prototype );
Composition.prototype.constructor = Composition;

module.exports = Composition;
