/**
 * Here for the examples
 */

var DOM = {
    
    extend: function(element) {
        Object.defineProperty(element, "width", {
            get: function() {
                return Number( this.style.width.replace("px", "") );
            },
            set: function(value) {
                this.style.width = value + "px";
            }
        });
        
        Object.defineProperty(element, "height", {
            get: function() {
                return Number( this.style.height.replace("px", "") );
            },
            set: function(value) {
                this.style.height = value + "px";
            }
        });
        
        Object.defineProperty(element, "x", {
            get: function() {
                return Number( this.style.left.replace("px", "") );
            },
            set: function(value) {
                this.style.left = value + "px";
            }
        });
        
        Object.defineProperty(element, "y", {
            get: function() {
                return Number( this.style.top.replace("px", "") );
            },
            set: function(value) {
                this.style.top = value + "px";
            }
        });
        
        Object.defineProperty(element, "opacity", {
            get: function() {
                if(this.style.opacity === "") return 1;
                return Number( this.style.opacity );
            },
            set: function(value) {
                this.style.opacity = value;
            }
        });
    }
    
};
