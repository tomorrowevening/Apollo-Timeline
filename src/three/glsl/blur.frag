varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float aspect;
uniform float radius;
uniform vec2 resolution;
uniform vec2 dir;

#pragma glslify: blur13 = require('glsl-fast-gaussian-blur/13')
#pragma glslify: blur5 = require('glsl-fast-gaussian-blur/5')

#ifdef LOW_QUALITY
  #define blur blur5
#else
  #define blur blur13
#endif

void main() {
  if(radius > 0.0) {
    gl_FragColor.rgb = blur(tDiffuse, vUv, resolution, dir * radius).rgb;
  } else {
    gl_FragColor.rgb = texture2D(tDiffuse, vUv).rgb;
  }
  gl_FragColor.a = 1.0;
}