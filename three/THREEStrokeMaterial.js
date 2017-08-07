'use strict';

var StrokeVertex = '\n  uniform float thickness;\n  attribute float lineMiter;\n  attribute vec2 lineNormal;\n  attribute vec2 lineDistance; // x = pos, y = total length\n  varying vec2 lineU;\n\n  void main() {\n    lineU = lineDistance;\n    vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );\n  }\n';

var StrokeFragment = '\n  varying vec2 lineU;\n\n  uniform vec3 diffuse;\n  uniform float opacity;\n  uniform vec3 dash; // x = dash,  y = gap, z = offset\n  uniform vec3 trim; // x = start, y = end, z = offset\n\n  void main() {\n    float opacityMod = 1.0;\n    \n    // Dash\n    if(dash.x > 0.0 && dash.y > 0.0) {\n      float dashEnd = dash.x + dash.y;\n      float lineUMod = mod(lineU.x + dash.z, dashEnd);\n      opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);\n    }\n    \n    // Trim\n    if(trim.x > 0.0 || trim.y < 1.0) {\n      float per = lineU.x / lineU.y;\n      float start = min(trim.x, trim.y) + trim.z;\n      float end = max(trim.x, trim.y) + trim.z;\n      \n      if(start == end) {\n        opacityMod = 0.0;\n      } else if(end > 1.0) {\n        if(per > end - 1.0 && per < start) {\n          opacityMod = 0.0;\n        }\n      } else if(start < 0.0) {\n        if(per > end && per < start + 1.0) {\n          opacityMod = 0.0;\n        }\n      } else if(per < start || per > end) {\n        opacityMod = 0.0;\n      }\n    }\n    \n    if(opacityMod == 0.0) {\n      discard;\n    }\n    gl_FragColor = vec4(diffuse, opacity * opacityMod);\n  }\n';

module.exports = function (THREE) {
  function THREEStrokeMaterial(opt) {
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
      vertexShader: StrokeVertex,
      fragmentShader: StrokeFragment,
      side: opt.side !== undefined ? opt.side : THREE.DoubleSide,
      transparent: opt.transparent !== undefined ? opt.transparent : true
    });
  }

  return THREEStrokeMaterial;
};