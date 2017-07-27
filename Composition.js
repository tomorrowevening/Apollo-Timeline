"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),_Layer2=require("./Layer"),_Layer3=_interopRequireDefault(_Layer2),_Timeline=require("./Timeline"),_Timer=require("apollo-utils/Timer"),Composition=function(e){function t(e){_classCallCheck(this,t);var i=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return i.layers=[],i.timeline=new _Timeline.Timeline,void 0!==e.duration&&(i.timeline.duration=e.duration),void 0!==e.maxPlays&&(i.timeline.maxPlays=e.maxPlays),void 0!==e.mode&&(i.timeline.mode=e.mode),i.showing=0===i.start,i}return _inherits(t,e),_createClass(t,[{key:"addLayer",value:function(e){e.showing=0===this.start&&0===e.start,this.layers.push(e)}},{key:"update",value:function(e){this.timeline.update(),this.updateLayers()}},{key:"updateHandler",value:function(){this.update(this.seconds),this.draw()}},{key:"updateLayers",value:function(){for(var e=this.seconds,i=this.layers.length,n=0;n<i;++n){var r=this.layers[n],o=r.showable(e);o?r instanceof t?(!r.showing&&r.timeline.restartable&&(r.timeline.time.stamp=_Timer.TIME.now()),r.update(e-r.start)):r.update(e-r.start):r.showing&&r.timeline.playing&&r.timeline.seconds>0&&(r.timeline.seconds=r.timeline.duration,r.timeline.time.speed<0&&(r.timeline.seconds=0),(r.timeline.maxPlays>0&&r.timeline.timesPlayed>=r.timeline.maxPlays||"once"===r.timeline.mode)&&(r.timeline.playing=!1)),r.showing=o}}},{key:"seconds",get:function(){return this.timeline.seconds}}]),t}(_Layer3["default"]);exports["default"]=Composition;