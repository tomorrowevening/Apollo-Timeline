/**
 * Here for the examples
 */

var DOM = {
    
    extend: function(element, unit) {
        element.unit = unit !== undefined ? unit : "px";
        
        Object.defineProperty(element, "width", {
            get: function() {
                return Number( this.style.width.replace(this.unit, "") );
            },
            set: function(value) {
                this.style.width = value + this.unit;
            }
        });
        
        Object.defineProperty(element, "height", {
            get: function() {
                return Number( this.style.height.replace(this.unit, "") );
            },
            set: function(value) {
                this.style.height = value + this.unit;
            }
        });
        
        Object.defineProperty(element, "x", {
            get: function() {
                return Number( this.style.left.replace(this.unit, "") );
            },
            set: function(value) {
                this.style.left = value + this.unit;
            }
        });
        
        Object.defineProperty(element, "y", {
            get: function() {
                return Number( this.style.top.replace(this.unit, "") );
            },
            set: function(value) {
                this.style.top = value + this.unit;
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
