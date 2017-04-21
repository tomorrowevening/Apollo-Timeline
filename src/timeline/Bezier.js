/**
 * Bezier
 * @author Colin Duffy
 */
export default class Bezier {
    
    constructor(x0, y0, x1, y1) {
        this.x0 = x0 !== undefined ? x0 : 0.25;
        this.y0 = y0 !== undefined ? y0 : 0.25;
        this.x1 = x1 !== undefined ? x1 : 0.75;
        this.y1 = y1 !== undefined ? y1 : 0.75;
    }
    
    set(x0, y0, x1, y1) {
        if(x0 !== undefined) this.x0 = x0;
        if(y0 !== undefined) this.y0 = y0;
        if(x1 !== undefined) this.x1 = x1;
        if(y1 !== undefined) this.y1 = y1;
    }
    
    // Non-static
    
    at(percent) {
        return Bezier.curveAt(percent, this.x0, this.y0, this.x1, this.y1);
    }
    
    isLinear() {
        return Bezier.isLinear(this.x0, this.y0, this.x1, this.y1);
    }
    
    // Static
    
    static isLinear() {
        return this.x0 === 1-this.x1 && this.y0 === 1-this.y1;
    }
    
    static curveAt(percent, x0, y0, x1, y1) {
        if(percent <= 0) return 0;
        if(percent >= 1) return 1;
        if( Bezier.isLinear(x0, y0, x1, y1) ) return percent; // linear
        
        let x0a = 0;  // initial x
        let y0a = 0;  // initial y
        let x1a = x0; // 1st influence x
        let y1a = y0; // 1st influence y
        let x2a = x1; // 2nd influence x
        let y2a = y1; // 2nd influence y
        let x3a = 1;  // final x
        let y3a = 1;  // final y

        let A =     x3a - 3.0*x2a + 3.0*x1a - x0a;
        let B = 3.0*x2a - 6.0*x1a + 3.0*x0a;
        let C = 3.0*x1a - 3.0*x0a;
        let D =     x0a;

        let E =     y3a - 3.0*y2a + 3.0*y1a - y0a;
        let F = 3.0*y2a - 6.0*y1a + 3.0*y0a;
        let G = 3.0*y1a - 3.0*y0a;
        let H =     y0a;

        let current = percent;
        
        let i, currentx, currentslope;
        for(i = 0; i < 5; i++){
            currentx = Bezier.xFromT(current, A,B,C,D);
            currentslope = Bezier.slopeFromT(current, A,B,C);
            current -= (currentx - percent)*(currentslope);
            current = Math.min(Math.max(current, 0.0),1.0);
        }

        return Bezier.yFromT(current, E, F,G,H);
    }
    
    static slopeFromT(t, A, B, C) {
        return 1.0/(3.0*A*t*t + 2.0*B*t + C);
    }
    
    static xFromT(t, A, B, C, D) {
        return A*(t*t*t) + B*(t*t) + C*t + D;
    }
    
    static yFromT(t, E, F, G, H) {
        let tt = t*t;
        return E*(tt*t) + F*tt + G*t + H;
    }
    
    static getEase(name) {
        var ease = undefined;
        switch(name) {
            case "linear":
                ease = new Bezier();
            break;
            
            // In
            
            case "inQuad":
                ease = new Bezier(0.550, 0.085, 0.680, 0.530);
            break;
            case "inCubic":
                ease = new Bezier(0.550, 0.055, 0.675, 0.190);
            break;
            case "inQuart":
                ease = new Bezier(0.895, 0.030, 0.685, 0.220);
            break;
            case "inQuint":
                ease = new Bezier(0.755, 0.050, 0.855, 0.060);
            break;
            case "inSine":
                ease = new Bezier(0.470, 0.000, 0.745, 0.715);
            break;
            case "inExpo":
                ease = new Bezier(0.950, 0.050, 0.795, 0.035);
            break;
            case "inCirc":
                ease = new Bezier(0.600, 0.040, 0.980, 0.335);
            break;
            case "inBack":
                ease = new Bezier(0.600, 0, 0.735, 0.045);
            break;
            
            // Out
            
            case "outQuad":
                ease = new Bezier(0.250, 0.460, 0.450, 0.940);
            break;
            case "outCubic":
                ease = new Bezier(0.215, 0.610, 0.355, 1.000);
            break;
            case "outQuart":
                ease = new Bezier(0.165, 0.840, 0.440, 1.000);
            break;
            case "outQuint":
                ease = new Bezier(0.230, 1.000, 0.320, 1.000);
            break;
            case "outSine":
                ease = new Bezier(0.390, 0.575, 0.565, 1.000);
            break;
            case "outExpo":
                ease = new Bezier(0.190, 1.000, 0.220, 1.000);
            break;
            case "outCirc":
                ease = new Bezier(0.075, 0.820, 0.165, 1.000);
            break;
            case "outBack":
                ease = new Bezier(0.175, 0.885, 0.320, 1);
            break;
            
            // InOut
            
            case "inOutQuad":
                ease = new Bezier(0.455, 0.030, 0.515, 0.955);
            break;
            case "inOutCubic":
                ease = new Bezier(0.645, 0.045, 0.355, 1.000);
            break;
            case "inOutQuart":
                ease = new Bezier(0.770, 0.000, 0.175, 1.000);
            break;
            case "inOutQuint":
                ease = new Bezier(0.860, 0.000, 0.070, 1.000);
            break;
            case "inOutSine":
                ease = new Bezier(0.445, 0.050, 0.550, 0.950);
            break;
            case "inOutExpo":
                ease = new Bezier(1.000, 0.000, 0.000, 1.000);
            break;
            case "inOutCirc":
                ease = new Bezier(0.785, 0.135, 0.150, 0.860);
            break;
            case "inOutBack":
                ease = new Bezier(0.680, 0, 0.265, 1);
            break;
        }
        return ease;
    }
    
}