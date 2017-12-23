var THREE = require('THREE');
import { renderer } from '../models/three';

let camera, visible = false;
let textureY = 0;

export default class ThreeHUD extends THREE.Scene {
  constructor() {
    super();
    
    camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.resize(window.innerWidth, window.innerHeight);
    window.hud = this;
  }
  
  show() { visible = true; }
  hide() { visible = false; }
  
  draw() {
    if(!visible) return;
    renderer.clearDepth();
    renderer.render(this, camera);
  }
  
  resize(w, h) {
    camera.left   = w / -2;
    camera.right  = w /  2;
    camera.top    = h /  2;
    camera.bottom = h / -2;
    
    // Centered
    camera.position.x = w /  2;
    camera.position.y = h / -2;
    
    camera.updateProjectionMatrix();
  }
  
  addTexture(texture, name, width, height) {
    let geom = new THREE.PlaneBufferGeometry(width, height, 1, 1);
    geom.topLeftAnchor();
    let mat  = new THREE.MeshBasicMaterial({
      map: texture
    });
    let mesh = new THREE.Mesh(geom, mat);
    mesh.name = name;
    mesh.position.y = textureY;
    this.add(mesh);
    
    textureY -= height + 20;
    
    return mat;
  }
}
