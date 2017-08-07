var getNormals = require('polyline-normals');
var VERTS_PER_POINT = 2;

function distance2(x1, y1, x2, y2) {
  var xd = (x1-x2) * (x1-x2);
  var yd = (y1-y2) * (y1-y2);
  return Math.sqrt( xd + yd );
}

/**
 * Based on https://github.com/mattdesl/three-line-2d
 */
module.exports = function(THREE) {
  class THREELineGeometry extends THREE.BufferGeometry {
    constructor(path, opt) {
      super();
      
      this.pathLength = 0;
      
      if (Array.isArray(path)) {
        opt = opt || {};
      } else if (typeof path === 'object') {
        opt = path;
        path = [];
      }

      opt = opt || {};

      this.addAttribute('position', new THREE.BufferAttribute(undefined, 3));
      this.addAttribute('lineNormal', new THREE.BufferAttribute(undefined, 2));
      this.addAttribute('lineMiter', new THREE.BufferAttribute(undefined, 1));
      if(opt.distances) {
        this.addAttribute('lineDistance', new THREE.BufferAttribute(undefined, 2));
      }
      if(typeof this.setIndex === 'function') {
        this.setIndex(new THREE.BufferAttribute(undefined, 1));
      } else {
        this.addAttribute('index', new THREE.BufferAttribute(undefined, 1));
      }
      this.update(path, opt.closed);
    }
    
    update(path, closed) {
      path = path || [];
      var normals = getNormals(path, closed);

      if (closed) {
        path = path.slice();
        path.push(path[0]);
        normals.push(normals[0]);
      }

      var attrPosition = this.getAttribute('position');
      var attrNormal = this.getAttribute('lineNormal');
      var attrMiter = this.getAttribute('lineMiter');
      var attrDistance = this.getAttribute('lineDistance');
      var attrIndex = typeof this.getIndex === 'function' ? this.getIndex() : this.getAttribute('index');

      var indexCount = Math.max(0, (path.length - 1) * 6);
      if (!attrPosition.array ||
          (path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT)) {
        var count = path.length * VERTS_PER_POINT;
        attrPosition.array = new Float32Array(count * 3);
        attrNormal.array = new Float32Array(count * 2);
        attrMiter.array = new Float32Array(count);
        attrIndex.array = new Uint16Array(indexCount);

        if (attrDistance) {
          attrDistance.array = new Float32Array(count * 2);
        }
      }

      if (undefined !== attrPosition.count) {
        attrPosition.count = count;
      }
      attrPosition.needsUpdate = true;

      if (undefined !== attrNormal.count) {
        attrNormal.count = count;
      }
      attrNormal.needsUpdate = true;

      if (undefined !== attrMiter.count) {
        attrMiter.count = count;
      }
      attrMiter.needsUpdate = true;

      if (undefined !== attrIndex.count) {
        attrIndex.count = indexCount;
      }
      attrIndex.needsUpdate = true;

      if (attrDistance) {
        if (undefined !== attrDistance.count) {
          attrDistance.count = count;
        }
        attrDistance.needsUpdate = true;
      }

      var index = 0;
      var c = 0;
      var dIndex = 0;
      var indexArray = attrIndex.array;
      var pathLength = 0, lastPt = undefined;
      
      // Determine path length
      path.forEach(function (point, pointIndex, list) {
        if(lastPt !== undefined) {
          pathLength += distance2(point[0], point[1], lastPt[0], lastPt[1]);
        }
        lastPt = point;
      });
      
      this.pathLength = pathLength;
      
      // Determine normalized position of each vertice along path
      lastPt = undefined;
      var pos = 0, per = 0;
      path.forEach(function (point, pointIndex, list) {
        var i = index;
        indexArray[c++] = i + 0;
        indexArray[c++] = i + 1;
        indexArray[c++] = i + 2;
        indexArray[c++] = i + 2;
        indexArray[c++] = i + 1;
        indexArray[c++] = i + 3;
        
        var dist = 0;
        
        if(lastPt !== undefined) {
          dist = distance2(point[0], point[1], lastPt[0], lastPt[1]);
        }
        lastPt = point;

        attrPosition.setXYZ(index++, point[0], point[1], 0);
        attrPosition.setXYZ(index++, point[0], point[1], 0);

        if (attrDistance) {
          pos += dist;
          per += dist / pathLength;
          attrDistance.setXY(dIndex++, pos, pathLength);
          attrDistance.setXY(dIndex++, pos, pathLength);
        }
      });

      var nIndex = 0;
      var mIndex = 0;
      normals.forEach(function (n) {
        var norm = n[0];
        var miter = n[1];
        attrNormal.setXY(nIndex++, norm[0], norm[1]);
        attrNormal.setXY(nIndex++, norm[0], norm[1]);

        attrMiter.setX(mIndex++, -miter);
        attrMiter.setX(mIndex++, miter);
      });
    }
    
    static createPath(geometry, scalar) {
      const s = scalar ? window.devicePixelRatio : 1;
      var path = [];
      let i, total = geometry.vertices.length;
      for(i = 0; i < total; ++i) {
        path.push([geometry.vertices[i].x * s, geometry.vertices[i].y * s]);
      }
      return path;
    }
  }
  
  return THREELineGeometry;
}
