import Layer from './Layer';

export class Shape {
  constructor() {
    this.fill = {
      color: 0xFFFFFF,
      enable: true
    };

    this.stroke = {
      color: 0xFFFFFF,
      enable: true,
      thickness: 1
    };

    this.vertices = [];
  }

  update() {}
  draw() {}
}

export class LayerShape extends Layer {
  constructor(obj) {
    super(obj);
    this.item = new Shape();
  }
}
