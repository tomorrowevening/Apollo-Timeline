"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.LayerAudio=void 0;var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),_TimelineConfig=require("./TimelineConfig"),_TimelineConfig2=_interopRequireDefault(_TimelineConfig),_Layer2=require("./Layer"),_Layer3=_interopRequireDefault(_Layer2),LayerAudio=exports.LayerAudio=function(e){function t(e){_classCallCheck(this,t);var r=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.timestamp=0,void 0!==e.content&&(r.fileID=_TimelineConfig2["default"].fileID(e.content.source),r.file=_TimelineConfig2["default"].audio[r.fileID]),r}return _inherits(t,e),_createClass(t,[{key:"update",value:function(e){var t=Date.now(),r=(t-this.timestamp)/1e3;r>1&&this.file.play(),this.timestamp=t}}]),t}(_Layer3["default"]);