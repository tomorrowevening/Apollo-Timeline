"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _TimelineConfig=require("../TimelineConfig"),_TimelineConfig2=_interopRequireDefault(_TimelineConfig),_THREELayer2=require("./THREELayer"),_THREELayer3=_interopRequireDefault(_THREELayer2);require("apollo-utils/ThreeUtil")(THREE),module.exports=function(e){var t=function(t){function r(t,n){_classCallCheck(this,r);var i=_possibleConstructorReturn(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,t,n)),o=t.content.source;i.fileID=_TimelineConfig2["default"].fileID(o),i.file=_TimelineConfig2["default"].video[i.fileID],i.file.autoplay=!1,i.file.pause();var l=new e.VideoTexture(i.file),a=new e.PlaneGeometry(t.content.width,t.content.height);a.topLeftAnchor(!0);var u=new e.MeshBasicMaterial({map:l,side:e.DoubleSide,depthTest:!1});return i.mesh=new e.Mesh(a,u),i.item.add(i.mesh),_THREELayer3["default"].transform(i.item,i.mesh,t.transform,n),i}return _inherits(r,t),r}(_THREELayer3["default"]);return t};