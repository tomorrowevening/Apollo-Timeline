'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layer = function () {
  function Layer(obj) {
    _classCallCheck(this, Layer);

    this.name = obj.name !== undefined ? obj.name : '';
    this.start = obj.start !== undefined ? obj.start : 0;
    this.duration = obj.duration !== undefined ? obj.duration : 0;
    this.fileID = '';
    this.file = undefined;
    this.item = undefined;
    this.showing = obj.showing !== undefined ? obj.showing : true;
  }

  _createClass(Layer, [{
    key: 'update',
    value: function update(time) {
      if (this.item !== undefined && this.item.update !== undefined) {
        this.item.update(time);
      }
    }
  }, {
    key: 'draw',
    value: function draw() {
      if (this.item !== undefined && this.item.draw !== undefined) {
        this.item.draw();
      }
    }
  }, {
    key: 'resize',
    value: function resize(w, h) {
      if (this.item !== undefined && this.item.resize !== undefined) {
        this.item.resize(w, h);
      }
    }
  }, {
    key: 'animate',
    value: function animate(json, timeline) {
      if (this.item !== undefined && this.item.animate !== undefined) {
        this.item.animate(json, timeline);
      }
    }
  }, {
    key: 'transform',
    value: function transform(json, timeline) {
      if (this.item !== undefined && this.item.transform !== undefined) {
        this.item.transform(json, timeline);
      }
    }
  }, {
    key: 'showable',
    value: function showable(time) {
      var endTime = this.start + this.duration;
      return this.duration > 0 ? time >= this.start && time <= endTime : true;
    }
  }]);

  return Layer;
}();

exports.default = Layer;