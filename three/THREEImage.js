"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _TimelineConfig=require("../TimelineConfig"),_TimelineConfig2=_interopRequireDefault(_TimelineConfig),_THREELayer2=require("./THREELayer"),_THREELayer3=_interopRequireDefault(_THREELayer2);module.exports=function(e){var t=function(t){function n(t,r){_classCallCheck(this,n);var i=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,t,r)),o=t.content.source,a=_TimelineConfig2["default"].fileID(o),u=_TimelineConfig2["default"].images[a],s=_TimelineConfig2["default"].textures[a],l=o.search(".png")>-1,f=new e.PlaneGeometry(u.width,u.height);f.computeBoundingBox();var c=f.boundingBox,p=(c.max.x-c.min.x)/2,_=(c.max.y-c.min.y)/2,m=0;f.applyMatrix((new e.Matrix4).makeTranslation(p,-_,-m));var h=new e.MeshBasicMaterial({map:s,transparent:l,side:e.DoubleSide,depthTest:!1});return i.mesh=new e.Mesh(f,h),i.item.add(i.mesh),_THREELayer3["default"].transform(i.item,i.mesh,t.transform,r),i}return _inherits(n,t),n}(_THREELayer3["default"]);return t};