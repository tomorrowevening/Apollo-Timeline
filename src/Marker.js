export default class Marker {
  constructor(name, time, params) {
    this.name     = name;
    this.time     = time;
    this.active   = false;
    this.duration = 0;
    this.action   = '';
    this.trigger  = undefined; // function pointers
    this.complete = undefined; // function pointers
    if(params !== undefined) {
      if(params.duration !== undefined) this.duration = params.duration;
      if(params.action   !== undefined) this.action   = params.action;
      if(params.trigger  !== undefined) this.trigger  = params.trigger;
      if(params.complete !== undefined) this.complete = params.complete;
    }
  }
}
