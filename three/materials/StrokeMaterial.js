'use strict';

var glsl = require('glslify');

module.exports = function (THREE) {
  function StrokeMaterial(opt) {
    return new THREE.ShaderMaterial({
      uniforms: {
        thickness: {
          type: 'f',
          value: opt.thickness !== undefined ? opt.thickness : 4.0
        },
        opacity: {
          type: 'f',
          value: opt.opacity !== undefined ? opt.opacity : 1.0
        },
        diffuse: {
          type: 'c',
          value: new THREE.Color(opt.diffuse !== undefined ? opt.diffuse : 0xffffff)
        },
        dash: {
          type: 'f',
          value: opt.dash !== undefined ? opt.dash : new THREE.Vector3(0, 10, 0)
        },
        trim: {
          type: 'f',
          value: opt.trim !== undefined ? opt.trim : new THREE.Vector3(0, 1, 0)
        }
      },
      vertexShader: '#define GLSLIFY 1\nuniform float thickness;\nattribute float lineMiter;\nattribute vec2 lineNormal;\nattribute vec2 lineDistance; // x = pos, y = total length\nvarying vec2 lineU;\n\nvoid main() {\n  lineU = lineDistance;\n  vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );\n}',
      fragmentShader: '#define GLSLIFY 1\nvarying vec2 lineU; // x = pos, y = total length\n\nuniform vec3 diffuse;\nuniform float opacity;\nuniform vec3 dash; // x = dash,  y = gap, z = offset\nuniform vec3 trim; // x = start, y = end, z = offset\n\nvoid main() {\n  float opacityMod = 1.0;\n  float offset = trim.z;\n  \n  // Dash\n  if(dash.x > 0.0 && dash.y > 0.0) {\n    offset = trim.z * 360.0;\n    float dashEnd = dash.x + dash.y;\n    float lineUMod = mod(lineU.x + dash.z - offset, dashEnd);\n    opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);\n  }\n  \n  // Trim\n  if(trim.x > 0.0 || trim.y < 1.0) {\n    offset = trim.z;\n    float per = lineU.x / lineU.y;\n    float start = min(trim.x, trim.y) + offset;\n    float end = max(trim.x, trim.y) + offset;\n    \n    if(start == end) {\n      opacityMod = 0.0;\n    } else if(end > 1.0) {\n      if(per > end - 1.0 && per < start) {\n        opacityMod = 0.0;\n      }\n    } else if(start < 0.0) {\n      if(per > end && per < start + 1.0) {\n        opacityMod = 0.0;\n      }\n    } else if(per < start || per > end) {\n      opacityMod = 0.0;\n    }\n  }\n  \n  if(opacityMod == 0.0) {\n    discard;\n  }\n  gl_FragColor = vec4(diffuse, opacity * opacityMod);\n}',
      side: opt.side !== undefined ? opt.side : THREE.DoubleSide,
      transparent: opt.transparent !== undefined ? opt.transparent : true
    });
  }

  return StrokeMaterial;
};