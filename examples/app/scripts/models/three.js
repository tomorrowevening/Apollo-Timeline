var THREE = require('THREE');
require('apollo-utils/ThreeUtil')(THREE);
import { BG_COLOR, canvas } from './global';

export const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  stencil: false,
  depth: true,
  alpha: false,
  preserveDrawingBuffer: false
});
renderer.autoClear = false;
renderer.sortObjects = false;
renderer.shadowMap.enabled = false;
renderer.setClearColor( BG_COLOR );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
