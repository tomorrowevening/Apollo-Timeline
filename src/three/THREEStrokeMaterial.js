const StrokeVertex = `
  uniform float thickness;
  attribute float lineMiter;
  attribute vec2 lineNormal;
  attribute vec2 lineDistance; // x = pos, y = total length
  varying vec2 lineU;

  void main() {
    lineU = lineDistance;
    vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );
  }
`;

const StrokeFragment = `
  varying vec2 lineU;

  uniform vec3 diffuse;
  uniform float opacity;
  uniform vec3 dash; // x = dash,  y = gap, z = offset
  uniform vec3 trim; // x = start, y = end, z = offset

  void main() {
    float opacityMod = 1.0;
    
    // Dash
    if(dash.x > 0.0 && dash.y > 0.0) {
      float dashEnd = dash.x + dash.y;
      float lineUMod = mod(lineU.x + dash.z, dashEnd);
      opacityMod = 1.0 - smoothstep(dash.x, dash.x + 0.01, lineUMod);
    }
    
    // Trim
    if(trim.x > 0.0 || trim.y < 1.0) {
      float a = mod(trim.x + trim.z, 1.0);
      float b = mod(trim.y + trim.z, 1.0);
      float per = lineU.x / lineU.y;
      if(a < b) {
        if(per < a || per > b) {
          opacityMod = 0.0;
        }
      } else if(a > b) {
        if(per < a && per > b) {
          opacityMod = 0.0;
        }
      }
    }
    
    if(opacityMod == 0.0) {
      discard;
    }
    gl_FragColor = vec4(diffuse, opacity * opacityMod);
  }
`;

module.exports = function(THREE) {
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
}