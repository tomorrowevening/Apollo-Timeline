"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Timeline=exports.PlayMode=void 0;var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var s=t[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,i,s){return i&&e(t.prototype,i),s&&e(t,s),t}}(),_Timer=require("./Timer"),PlayMode=exports.PlayMode={LOOP:"loop",ONCE:"once",PING_PONG:"pingPong"},Timeline=exports.Timeline=function(){function e(){_classCallCheck(this,e),this.duration=0,this.timesPlayed=0,this.maxPlays=0,this.mode=PlayMode.LOOP,this.keyframes=[],this.markers=[],this.delayed=[],this.playing=!0,this.lastMarker=void 0,this.time={elapsed:0,stamp:0,speed:1}}return _createClass(e,[{key:"add",value:function(e,t,i,s,a){a=void 0!==a?a:{};var r=this.seconds,n=new Keyframe(e,t,i,s,{delay:void 0!==a.delay?a.delay+r:r,ease:a.ease,start:a.start,onUpdate:a.onUpdate,onComplete:a.onComplete});return this.addKeyframe(n)}},{key:"addKeyframe",value:function(e){return this.keyframes.push(e),e}},{key:"addMarker",value:function(e){return this.markers.push(e),this}},{key:"delay",value:function(e,t,i){this.delayed.push({time:1e3*e+_Timer.TIME.now(),callback:t,params:i})}},{key:"dispose",value:function(){this.keyframes=[],this.markers=[],this.delayed=[]}},{key:"play",value:function(){if(0===this.time.elapsed)for(var e=this.keyframes.length-1,t=e;t>-1;--t)this.keyframes[t].update(0),this.keyframes[t].active=!1;this.time.stamp=_Timer.TIME.now(),this.playing=!0}},{key:"pause",value:function(){this.playing=!1}},{key:"update",value:function(){if(this.playing){var e=_Timer.TIME.now(),t=e-this.time.stamp;this.time.elapsed+=t*this.time.speed,this.time.stamp=e,this.updateDelayed(),this.duration>0&&this.updatePlaymode(),this.updateMarkers(),this.updateKeyframes()}}},{key:"updateDelayed",value:function(){var e=_Timer.TIME.now(),t=void 0,i=void 0,s=this.delayed.length;for(t=0;t<s;++t)i=this.delayed[t],e>=i.time&&(i.callback(i.params),this.delayed.splice(t,1),--t,--s)}},{key:"updateKeyframes",value:function(){var e,t,i,s,a=this.keyframes.length,r=this.seconds;for(e=0;e<a;++e)i=this.keyframes[e],t=r,s=(t-i.timestamp)/i.duration,i.isActive(t)?(!i.active&&void 0===i.startValue&&this.time.speed>0&&(i.startValue=i.object[i.key]),i.active=!0,i.update(s)):i.active?(i.active=!1,this.time.speed<0?i.restart():i.complete()):(i.active=!1,0===this.duration&&t-i.timestamp>1&&(this.keyframes.splice(e,1),--e,--a))}},{key:"updateMarkers",value:function(){var e=this.prevSeconds,t=this.seconds;if(!(e>t))for(var i=Math.min(e,t),s=Math.max(e,t),a=this.markers.length,r=0;r<a;++r){var n=this.markers[r],d=n.time,o=n.duration+d,h=d>i&&d<=s;n.duration>0&&(h=t>d&&t<=o),h?(n.active||this.trigger(r),n.active=!0):n.active&&(n.active=!1,void 0!==n.complete&&n.complete())}}},{key:"updatePlaymode",value:function(){var e=this.seconds;if(this.mode===PlayMode.PING_PONG)e>=this.duration?(this.time.elapsed=1e3*this.duration-1,this.time.speed*=-1):e<0&&(this.time.elapsed=1,this.time.speed=Math.abs(this.time.speed),++this.timesPlayed,this.maxPlays>0&&this.timesPlayed>=this.maxPlays&&this.pause());else if(this.mode===PlayMode.LOOP){if(e>this.duration)if(++this.timesPlayed,this.maxPlays>0&&this.timesPlayed>=this.maxPlays)this.pause(),this.time.elapsed=0;else{this.time.elapsed=0;for(var t=this.keyframes.length-1,i=t;i>-1;--i)this.keyframes[i].update(0),this.keyframes[i].active=!1}}else e>this.duration&&(++this.timesPlayed,this.pause(),this.time.elapsed=0)}},{key:"trigger",value:function(e){var t=this.markers[e];return void 0!==t&&("stop"===t.action?(this.pause(),this.seconds=t.time):"delay"===t.action&&t.trigger(),!0)}},{key:"goToMarker",value:function(e){var t=this.getMarker(e);return void 0!==t&&(this.seconds=t.time,this.play()),t}},{key:"getMarker",value:function(e){var t=void 0,i=this.markers.length;for(t=0;t<i;++t){var s=this.markers[t];if(s.name===e)return s}}},{key:"playMode",get:function(){return this.mode},set:function(e){this.mode=e,e!==PlayMode.LOOP&&e!==PlayMode.ONCE||(this.time.speed=Math.abs(this.time.speed))}},{key:"seconds",get:function(){return this.time.elapsed/1e3},set:function(e){this.time.elapsed=1e3*e}},{key:"speed",get:function(){return this.time.speed},set:function(e){this.time.speed=e}},{key:"restartable",get:function(){return!!this.playing&&(!(this.maxPlays>0&&this.timesPlayed>=this.maxPlays)&&!(this.mode===PlayMode.LOOP&&this.timesPlayed>0))}}]),e}();