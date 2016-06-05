/**
 * Marker
 * @author Colin Duffy
 */

function Marker(name, time, action) {
    this.name    = name   !== undefined ? name   : "";
    this.time    = time   !== undefined ? time   : 0;
    this.action  = action !== undefined ? action : "";
    return this;
};

module.exports = Marker;
