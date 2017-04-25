export default class Marker {
    constructor(name, time, action, duration, trigger) {
        this.name = name !== undefined ? name : "";
        this.time = time !== undefined ? time : 0;
        this.action = action !== undefined ? action : "";
        this.duration = duration !== undefined ? duration : 0;
        this.trigger = trigger !== undefined ? trigger : function() {};
    }
}
