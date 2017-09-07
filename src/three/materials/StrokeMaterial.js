var glsl = require('glslify');

module.exports = function(THREE) {
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
      vertexShader: glsl('../glsl/stroke.vert'),
      fragmentShader: glsl('../glsl/stroke.frag'),
      side: opt.side !== undefined ? opt.side : THREE.DoubleSide,
      transparent: opt.transparent !== undefined ? opt.transparent : true
    });
  }
  
  return StrokeMaterial;
}