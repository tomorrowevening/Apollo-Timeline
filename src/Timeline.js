import {
  Timer,
  TIME
} from './Timer';

export const PlayMode = {
  'LOOP': 'loop',
  'ONCE': 'once',
  'PING_PONG': 'pingPong'
};

export class Timeline {
  constructor() {
    this.duration = 0;
    this.timesPlayed = 0;
    this.maxPlays = 0;
    this.mode = PlayMode.LOOP;
    this.keyframes = [];
    this.markers = [];
    this.delayed = [];
    this.playing = true;
    this.lastMarker = undefined;
    this.time = {
      elapsed: 0,
      stamp: 0,
      speed: 1
    };
  }

  add(target, key, to, duration, params) {
    params = params !== undefined ? params : {};
    const now = this.seconds;
    let newKey = new Keyframe(target, key, to, duration, {
      delay: params.delay !== undefined ? params.delay + now : now,
      ease: params.ease,
      start: params.start,
      onUpdate: params.onUpdate,
      onComplete: params.onComplete
    });
    return this.addKeyframe(newKey);
  }

  addKeyframe(keyframe) {
    this.keyframes.push(keyframe);
    return keyframe;
  }

  addMarker(marker) {
    this.markers.push(marker);
    return this;
  }

  delay(wait, callback, params) {
    this.delayed.push({
      time: wait * 1000 + TIME.now(),
      callback: callback,
      params: params
    });
  }

  dispose() {
    this.keyframes = [];
    this.markers = [];
    this.delayed = [];
  }

  play() {
    if(this.time.elapsed === 0) {
      var total = this.keyframes.length - 1;
      for(var i = total; i > -1; --i) {
        this.keyframes[i].update(0);
        this.keyframes[i].active = false;
      }
    }
    this.time.stamp = TIME.now();
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  update() {
    if(!this.playing) return;

    let now = TIME.now();
    let delta = now - this.time.stamp;
    this.time.elapsed += delta * this.time.speed;
    this.time.stamp = now;

    // Update delayed calls
    this.updateDelayed();

    // Update play mode settings
    if(this.duration > 0) this.updatePlaymode();

    // Markers
    this.updateMarkers();

    // Update keyframes
    this.updateKeyframes();
  }

  updateDelayed() {
    const now = TIME.now();
    let i, delay, total = this.delayed.length;
    for(i = 0; i < total; ++i) {
      delay = this.delayed[i];
      if(now >= delay.time) {
        delay.callback(delay.params);
        // Remove from array
        this.delayed.splice(i, 1);
        --i;
        --total;
      }
    }
  }

  updateKeyframes() {
    var i, now, key, percent, total = this.keyframes.length;
    const seconds = this.seconds;

    for(i = 0; i < total; ++i) {
      key = this.keyframes[i];
      now = seconds;
      percent = (now - key.timestamp) / key.duration;

      if(key.isActive(now)) {

        // Auto-origin?
        if(!key.active && key.startValue === undefined && this.time.speed > 0) {
          key.startValue = key.object[key.key];
        }

        key.active = true;
        key.update(percent);

      } else if(key.active) {

        key.active = false;
        if(this.time.speed < 0) {
          key.restart();
        } else {
          key.complete();
        }

      } else {

        key.active = false;

        // Remove old keyframes that'll never be used again
        if(this.duration === 0 && now - key.timestamp > 1) {
          this.keyframes.splice(i, 1);
          --i;
          --total;
        }

      }

    }
  }

  updateMarkers() {
    var before = this.prevSeconds;
    var now = this.seconds;
    if(before > now) return; // looping

    var min = Math.min(before, now);
    var max = Math.max(before, now);
    var total = this.markers.length;
    for(var i = 0; i < total; ++i) {
      var marker = this.markers[i];
      var start = marker.time;
      var end = marker.duration + start;
      var active = start > min && start <= max;
      if(marker.duration > 0) {
        active = now > start && now <= end;
      }
      if(active) {
        if(!marker.active) this.trigger(i);
        marker.active = true;
      } else if(marker.active) {
        marker.active = false;
        if(marker.complete !== undefined) {
          marker.complete();
        }
      }
    }
  }

  updatePlaymode() {
    const seconds = this.seconds;
    if(this.mode === PlayMode.PING_PONG) {

      if(seconds >= this.duration) {
        this.time.elapsed = this.duration * 1000 - 1;
        this.time.speed *= -1;
      } else if(seconds < 0) {
        this.time.elapsed = 1;
        this.time.speed = Math.abs(this.time.speed);
        ++this.timesPlayed;

        if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
          this.pause();
        }
      }

    } else if(this.mode === PlayMode.LOOP) {

      if(seconds > this.duration) {
        ++this.timesPlayed;
        if(this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
          this.pause();
          this.time.elapsed = 0;
        } else {
          this.time.elapsed = 0;
          var total = this.keyframes.length - 1;
          for(var i = total; i > -1; --i) {
            this.keyframes[i].update(0);
            this.keyframes[i].active = false;
          }
        }
      }

    } else { // ONCE

      if(seconds > this.duration) {
        ++this.timesPlayed;
        this.pause();
        this.time.elapsed = 0;
      }

    }
  }

  trigger(index) {
    var marker = this.markers[index];
    if(marker === undefined) return false;

    // Timeline actions
    if(marker.action === 'stop') {
      this.pause();
      this.seconds = marker.time;
    } else if(marker.action === 'delay') {
      // delay call
      marker.trigger();
    }

    return true;
  }

  goToMarker(name) {
    let marker = this.getMarker(name);
    if(marker !== undefined) {
      this.seconds = marker.time;
      this.play();
    }
    return marker;
  }

  getMarker(name) {
    let i, total = this.markers.length;
    for(i = 0; i < total; ++i) {
      let marker = this.markers[i];
      if(marker.name === name) {
        return marker;
      }
    }
    return undefined;
  }

  // Getters

  get playMode() {
    return this.mode;
  }

  get seconds() {
    return this.time.elapsed / 1000;
  }

  get speed() {
    return this.time.speed;
  }

  get restartable() {
    if(!this.playing) return false;

    // Loop or PingPong
    if((this.maxPlays > 0 && this.timesPlayed >= this.maxPlays)) {
      return false;
    }

    if(this.mode === PlayMode.LOOP && this.timesPlayed > 0) {
      return false;
    }

    return true;
  }

  // Setters

  set playMode(value) {
    this.mode = value;
    if(value === PlayMode.LOOP || value === PlayMode.ONCE) {
      this.time.speed = Math.abs(this.time.speed);
    }
  }

  set seconds(value) {
    this.time.elapsed = value * 1000;
  }

  set speed(value) {
    this.time.speed = value;
  }
}