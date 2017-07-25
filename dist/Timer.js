"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TIME = exports.TIME = performance || Date;

var Timer = exports.Timer = function () {
    function Timer(onUpdate) {
        _classCallCheck(this, Timer);

        this.running = false;
        this.time = 1;
        this.timeStamp = 0;
        this.deltaStamp = 0;
        this.elapsedStamp = 0;
        this.delayed = [];
        this.onRAF = undefined;
        this.onUpdate = this.update.bind(this);
        this.updateHandler = onUpdate;
    }

    _createClass(Timer, [{
        key: "play",
        value: function play() {
            this.timeStamp = TIME.now();
            this.running = true;
            this.update();
        }
    }, {
        key: "pause",
        value: function pause() {
            window.cancelAnimationFrame(this.onRAF);
            this.running = false;
        }
    }, {
        key: "restart",
        value: function restart() {
            this.deltaStamp = this.elapsedStamp = 0;
            this.stamp();
        }
    }, {
        key: "stamp",
        value: function stamp() {
            this.timeStamp = TIME.now();
        }
    }, {
        key: "update",
        value: function update() {
            var now = TIME.now();
            this.deltaStamp = now - this.timeStamp;
            this.elapsedStamp += this.deltaStamp * this.time;
            this.timeStamp = now;

            var i = void 0,
                delay = void 0,
                total = this.delayed.length;
            for (i = 0; i < total; ++i) {
                delay = this.delayed[i];
                if (now >= delay.time) {
                    delay.callback(delay.params);

                    this.delayed.splice(i, 1);
                    --i;
                    --total;
                }
            }

            this.updateHandler();

            this.onRAF = window.requestAnimationFrame(this.onUpdate);
        }
    }, {
        key: "delay",
        value: function delay(wait, callback, params) {
            this.delayed.push({
                time: wait * 1000 + TIME.now(),
                callback: callback,
                params: params
            });
        }
    }, {
        key: "seconds",
        get: function get() {
            return this.elapsedStamp / 1000;
        },
        set: function set(value) {
            this.elapsedStamp = value * 1000;
        }
    }]);

    return Timer;
}();