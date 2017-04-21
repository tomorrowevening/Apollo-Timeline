export default class Marker {
    
    constructor(name, time, action, trigger) {
        this.name    = name !== undefined ? name : "";
        this.time    = time !== undefined ? time : 0;
        this.action  = action !== undefined ? action : "";
        this.trigger = trigger !== undefined ? trigger : function() {};
    }
    
}
