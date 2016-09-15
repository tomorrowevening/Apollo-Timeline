var Loader = require('apollo-utils/Loader');

function Layer( obj ) {
    this.name       = obj.name;
    this.start      = obj.start; // start time
    this.duration   = obj.duration; // duration the layer is in comp
    this.fileID     = ""; // to reclaim from Loader
    this.file       = undefined; // actual loaded asset
    this.item       = undefined; // Object layer
    this.showing    = false;
    
    this.update = function( time ) {
        if(this.item !== undefined && this.item.update !== undefined) {
            this.item.update();
        }
    }
    
    this.draw = function() {
        if(this.item !== undefined && this.item.draw !== undefined) {
            this.item.draw();
        }
    }
    
    this.animate = function(json, timeline) {
        if(this.item !== undefined && this.item["animate"] !== undefined) {
            this.item.animate(json, timeline);
        }
    }
    
    this.transform = function(json, timeline) {
        if(this.item !== undefined && this.item["transform"] !== undefined) {
            this.item.transform(json, timeline);
        }
    }
    
    // Getters
    
    this.isShowing = function(time) {
        const endTime = this.start + this.duration;
        return time >= this.start && time <= endTime;
    }
}

//////////////////////////////////////////////////
// Audio

function LayerAudio( obj ) {
    Layer.call(this, obj);
    
    this.fileID = Loader.fileID( obj.content.source );
    this.file   = Loader.audio[this.fileID];
    this.timestamp = 0;
    
    this.update = function( time ) {
        const now   = Date.now();
        const delta = (now - this.timestamp) / 1000; // in seconds
        
        if( delta > 1 ) {
            Loader.playAudio( this.fileID );
        }
        
        this.timestamp = now;
    }
}
LayerAudio.prototype = Object.create( Layer.prototype );
LayerAudio.prototype.constructor = LayerAudio;

//////////////////////////////////////////////////
// Image

function LayerImage( obj ) {
    Layer.call(this, obj);
    
    this.fileID = Loader.fileID( obj.content.source );
    this.file   = Loader.images[this.fileID];
}
LayerImage.prototype = Object.create( Layer.prototype );
LayerImage.prototype.constructor = LayerImage;

//////////////////////////////////////////////////
// Shape

function Shape() {
    this.fill       = {
        color:  0xFF0000,
        enable: true
    };
    this.stroke     = {
        color:  0xFFFFFF,
        enable: true,
        thickness: 1
    };
    this.vertices   = [];
    
    this.update     = function() {};
    this.draw       = function() {};
}

function LayerShape( obj ) {
    Layer.call(this, obj);
    
    this.item = new Shape();
}
LayerShape.prototype = Object.create( Layer.prototype );
LayerShape.prototype.constructor = LayerShape;

//////////////////////////////////////////////////
// Text

function LayerText( obj ) {
    Layer.call(this, obj);
}
LayerText.prototype = Object.create( Layer.prototype );
LayerText.prototype.constructor = LayerText;

// Export

module.exports = {
    Layer       : Layer,
    LayerAudio  : LayerAudio,
    LayerImage  : LayerImage,
    LayerShape  : LayerShape,
    LayerText   : LayerText,
    Shape       : Shape
};
