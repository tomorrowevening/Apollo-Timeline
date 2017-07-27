"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function styleOptions(e,t,a){var r={fill:"none",fillAlpha:1,stroke:void 0,strokeAlpha:1,strokeCap:"butt",strokeCorner:"miter",strokeDashes:void 0,strokeWidth:void 0,transform:void 0,timeline:[]},i=void 0,n=t.length;for(i=0;i<n;++i){var o=t[i];if("fill"===o.type){var l=Math.round(255*o.value.color[0]).toString(),s=Math.round(255*o.value.color[1]).toString(),c=Math.round(255*o.value.color[2]).toString(),f=o.value.opacity;r.fill="rgb("+l+", "+s+", "+c+")",r.fillAlpha=f,o.timeline.length>0&&(r.timeline=r.timeline.concat(o.timeline))}else if("stroke"===o.type){var u=Math.round(255*o.value.color[0]).toString(),h=Math.round(255*o.value.color[1]).toString(),m=Math.round(255*o.value.color[2]).toString();r.stroke="rgb("+u+", "+h+", "+m+")",r.strokeAlpha=o.value.opacity,r.strokeCap=o.value.cap,r.strokeCorner=o.value.corner,r.strokeDashes=o.value.dashes,r.strokeWidth=o.value.width,o.timeline.length>0&&(r.timeline=r.timeline.concat(o.timeline))}else if("transform"===o.type)r.transform=o;else if("trim"===o.type)for(var d=e.children.length,p=0;p<d;++p){var y=e.children[p];"path"===y.tagName&&applyTrimPath(y,o,a)}}return r}function applyTrimPath(e,t,a){e._startPercent=t.value.start,e._endPercent=t.value.end,e._offsetPercent=t.value.offset,e.updatePath();var r={start:"startPercent",end:"endPercent",offset:"offsetPercent"},i=void 0,n=t.timeline.length-1;for(i=n;i>-1;--i){var o=t.timeline[i],l=r[o.name];if(void 0!==l){var s=void 0,c=o.keys.length;for(s=0;s<c;++s){var f=o.keys[s],u=f.target,h=f.duration,m=f.x0,d=f.y0,p=f.x1,y=f.y1,v={ease:[m,d,p,y],start:f.value,delay:f.start},_=new _Keyframe2["default"](e,l,u,h,v);_.easeType=f.type,a.addKeyframe(_)}}}}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,a,r){return a&&e(t.prototype,a),r&&e(t,r),t}}(),_CSSUtil=require("apollo-utils/CSSUtil"),_SVGUtil=require("./SVGUtil"),_Keyframe=require("../Keyframe"),_Keyframe2=_interopRequireDefault(_Keyframe),SVGItem=function(){function e(t,a){_classCallCheck(this,e),this.item=(0,_SVGUtil.SVGCreate)(),(0,_CSSUtil.CSSExtend)(this.item),this.item.title=t.name;var r=(0,_SVGUtil.createMasks)(this.item,t);void 0!==t.transform&&transform(this.item,t.transform,a);for(var i=t.content.length,n=0;n<i;++n){var o=t.content[n],l=void 0,s=void 0;if("shape"===o.type){var c=styleOptions(this.item,o.content,a),f=(0,_SVGUtil.getMaxBorder)(c);for(s=o.paths.length,l=0;l<s;++l){var u=o.paths[l],h=void 0;switch(u.type){case"rectangle":h=(0,_SVGUtil.SVGRectangle)(u,c,this.item,a);break;case"ellipse":h=(0,_SVGUtil.SVGEllipse)(u,c,this.item,a),this.item.x-=f/2,this.item.y-=f/2;break;case"polygon":break;case"polystar":break;case"shape":h=(0,_SVGUtil.SVGShape)(u,c,this.item,a),this.item.x-=f/2,this.item.y-=f/2}void 0!==h&&(this.item.x-=f/2,this.item.y-=f/2,(0,_SVGUtil.applyMasks)(h,r),this.item.appendChild(h))}for(s=o.content.length,l=0;l<s;++l){var m=o.content[l];"trim"===m.type&&applyTrimPath(this.item.children[0],m,a)}}else if("trim"===o.type)for(s=this.item.children.length,l=0;l<s;++l){var d=this.item.children[l];"path"===d.tagName&&applyTrimPath(d,o,a)}}}return _createClass(e,null,[{key:"transform",value:function(e){function t(t,a,r){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(e,t,a){var r=t.anchor,i=t.position,n=t.rotation,o=t.scale,l=r[0]/e.width*100,s=r[1]/e.height*100;if(e.style.position="absolute",e.x=i[0],e.y=i[1],e.rotateX=n[0],e.rotateY=n[1],e.rotateZ=n[2],e.scaleX=o[0],e.scaleY=o[1],e.originX=l,e.originY=s,e.translateX=-r[0],e.translateY=-r[1],e.translateZ=i.length>2?i[2]:0,e.opacity=t.opacity,void 0!==t.timeline){var c=void 0,f=void 0,u=void 0,h=t.timeline.length;for(c=0;c<h;++c){var m=t.timeline[c];for(u=m.keys.length,f=0;f<u;++f){var d=m.keys[f],p=d.target,y=d.duration,v=d.x0,_=d.y0,g=d.x1,k=d.y1,S=void 0,b={ease:[v,_,g,k],start:d.value,delay:d.start};switch(m.name){case"opacity":S=new _Keyframe2["default"](e,"opacity",p,y,b);break;case"positionX":S=new _Keyframe2["default"](e,"x",p,y,b);break;case"positionY":S=new _Keyframe2["default"](e,"y",p,y,b);break;case"positionZ":S=new _Keyframe2["default"](e,"translateZ",p,y,b);break;case"rotationX":b.start*=-1,S=new _Keyframe2["default"](e,"rotateX",(-p),y,b);break;case"rotationY":b.start*=-1,S=new _Keyframe2["default"](e,"rotateY",(-p),y,b);break;case"rotationZ":S=new _Keyframe2["default"](e,"rotateZ",p,y,b);break;case"scaleX":S=new _Keyframe2["default"](e,"scaleX",p,y,b);break;case"scaleY":S=new _Keyframe2["default"](e,"scaleY",p,y,b);break;case"scaleZ":S=new _Keyframe2["default"](e,"scaleZ",p,y,b)}void 0!==S&&(S.easeType=d.type,a.addKeyframe(S))}}}})}]),e}();exports["default"]=SVGItem;