"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Timeline = exports.PlayMode = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Timer = require("./Timer");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlayMode = exports.PlayMode = {
    "LOOP": "loop",
    "ONCE": "once",
    "PING_PONG": "pingPong"
};

var Timeline = exports.Timeline = function () {
    function Timeline() {
        _classCallCheck(this, Timeline);

        this.duration = 0;
        this.timesPlayed = 0;
        this.maxPlays = 0;
        this.mode = PlayMode.LOOP;
        this.keyframes = [];
        this.markers = [];
        this.playing = true;
        this.lastMarker = undefined;
        this.time = {
            elapsed: 0,
            stamp: 0,
            speed: 1
        };
    }

    _createClass(Timeline, [{
        key: "add",
        value: function add(target, key, to, duration, delay, x0, y0, x1, y1, from, completeHandler, updateHandler) {
            var wait = this.duration === 0 ? this.seconds + delay : delay;
            var ease = [x0, y0, x1, y1];
            var newKey = new Keyframe(target, key, to, duration, wait, ease, from, completeHandler, updateHandler);
            return this.addKeyframe(newKey);
        }
    }, {
        key: "addKeyframe",
        value: function addKeyframe(keyframe) {
            this.keyframes.push(keyframe);
            return keyframe;
        }
    }, {
        key: "addMarker",
        value: function addMarker(marker) {
            this.markers.push(marker);
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            if (this.time.elapsed === 0) {
                var total = this.keyframes.length - 1;
                for (var i = total; i > -1; --i) {
                    this.keyframes[i].update(0);
                    this.keyframes[i].active = false;
                }
            }
            this.playing = true;
        }
    }, {
        key: "pause",
        value: function pause() {
            this.playing = false;
        }
    }, {
        key: "update",
        value: function update() {
            if (!this.playing) return;

            var now = _Timer.TIME.now();
            var delta = now - this.time.stamp;
            this.time.elapsed += delta * this.time.speed;
            this.time.stamp = now;

            if (this.duration > 0) this.updatePlaymode();

            this.updateMarkers();

            this.updateKeyframes();
        }
    }, {
        key: "updateKeyframes",
        value: function updateKeyframes() {
            var i,
                now,
                key,
                percent,
                total = this.keyframes.length;
            var seconds = this.seconds;

            for (i = 0; i < total; ++i) {
                key = this.keyframes[i];
                now = seconds;
                percent = (now - key.timestamp) / key.duration;

                if (key.isActive(now)) {
                    if (!key.active && key.startValue === undefined && this.time.speed > 0) {
                        key.startValue = key.object[key.key];
                    }

                    key.active = true;
                    key.update(percent);
                } else if (key.active) {

                    key.active = false;
                    if (this.time.speed < 0) {
                        key.restart();
                    } else {
                        key.complete();
                    }
                } else {

                    key.active = false;

                    if (this.duration === 0 && now - key.timestamp > 1) {
                        this.keyframes.splice(i, 1);
                        --i;
                        --total;
                    }
                }
            }
        }
    }, {
        key: "updateMarkers",
        value: function updateMarkers() {
            var before = this.prevSeconds;
            var now = this.seconds;
            if (before > now) return -1;

            var min = Math.min(before, now);
            var max = Math.max(before, now);
            var total = this.markers.length;
            for (var i = 0; i < total; ++i) {
                var m = this.markers[i].time;
                if (m > min && m <= max && this.markers[i] !== this.lastMarker) {
                    this.trigger(i);
                    this.lastMarker = this.markers[i];
                    return i;
                }
            }

            this.lastMarker = undefined;

            return -1;
        }
    }, {
        key: "updatePlaymode",
        value: function updatePlaymode() {
            var seconds = this.seconds;
            if (this.mode === PlayMode.PING_PONG) {

                if (seconds >= this.duration) {
                    this.time.elapsed = this.duration * 1000 - 1;
                    this.time.speed *= -1;
                } else if (seconds < 0) {
                    this.time.elapsed = 1;
                    this.time.speed = Math.abs(this.time.speed);
                    ++this.timesPlayed;

                    if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                        this.pause();
                    }
                }
            } else if (this.mode === PlayMode.LOOP) {

                if (seconds > this.duration) {
                    ++this.timesPlayed;
                    if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                        this.pause();
                        this.time.elapsed = 0;
                    } else {
                        this.time.elapsed = 0;
                        var total = this.keyframes.length - 1;
                        for (var i = total; i > -1; --i) {
                            this.keyframes[i].update(0);
                            this.keyframes[i].active = false;
                        }
                    }
                }
            } else {

                if (seconds > this.duration) {
                    ++this.timesPlayed;
                    this.pause();
                    this.time.elapsed = 0;
                }
            }
        }
    }, {
        key: "trigger",
        value: function trigger(index) {
            var marker = this.markers[index];
            if (marker === undefined) return false;

            if (marker.action === "stop") {
                this.pause();
                this.seconds = marker.time;
            } else if (marker.action === "delay") {
                marker.trigger();
            }

            return true;
        }
    }, {
        key: "playMode",
        get: function get() {
            return this.mode;
        },
        set: function set(value) {
            this.mode = value;
            if (value === PlayMode.LOOP || value === PlayMode.ONCE) {
                this.time.speed = Math.abs(this.time.speed);
            }
        }
    }, {
        key: "seconds",
        get: function get() {
            return this.time.elapsed / 1000;
        },
        set: function set(value) {
            this.time.elapsed = value * 1000;
        }
    }, {
        key: "speed",
        get: function get() {
            return this.time.speed;
        },
        set: function set(value) {
            this.time.speed = value;
        }
    }, {
        key: "restartable",
        get: function get() {
            if (!this.playing) return false;

            if (this.maxPlays > 0 && this.timesPlayed >= this.maxPlays) {
                return false;
            }

            if (this.mode === PlayMode.LOOP && this.timesPlayed > 0) {
                return false;
            }

            return true;
        }
    }]);

    return Timeline;
}();