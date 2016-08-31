/**
 * Marker
 * @author Colin Duffy
 */

function Marker(name, time, action, trigger) {
    this.name    = name    !== undefined ? name    : "";
    this.time    = time    !== undefined ? time    : 0;
    this.action  = action  !== undefined ? action  : "";
    this.trigger = trigger !== undefined ? trigger : function() {};
    return this;
};

module.exports = Marker;
