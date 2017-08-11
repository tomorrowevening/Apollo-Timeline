import { getHex } from 'apollo-utils/DOMUtil';

module.exports = function(THREE) {
  var THREELayer = require('./THREELayer')(THREE);
  
  const dpr = window.devicePixelRatio;
  
  //////////////////////////////////////////////////
  // Text
  
  class THREEText extends THREE.Object3D {
    constructor(text, options) {
      super();

      this.canvas   = new CanvasText();
      this._text    = '';
      this._color   = '#FFFFFF';
      this._font    = 'Arial';
      this._fontSize= 30;
      this._weight  = 'normal';
      this._letterSpacing = 20;
      this._textTop = 0;
      this.texture  = undefined;
      this.material = undefined;
      this.sprite   = undefined;

      if(options !== undefined) {
        if(options.color      !== undefined) this._color    = options.color;
        if(options.font       !== undefined) this._font     = options.font;
        if(options.fontSize   !== undefined) this._fontSize = options.fontSize;
        if(options.weight     !== undefined) this._weight   = options.weight;
        if(options.textTop    !== undefined) this._textTop  = options.textTop;
        if(options.letterSpacing !== undefined) {
          this._letterSpacing = options.letterSpacing;
        }
        if(options.lineHeight !== undefined) {
          this.canvas.lineHeight = options.lineHeight;
        }
      }

      this.text = text;
    }

    dispose() {
      if(this.texture !== undefined) {
        this.texture.dispose();
        this.texture = undefined;
      }
    }

    update() {
      this.canvas.draw(
        this._text,
        this._font,
        this._fontSize,
        this._weight,
        this._color,
        this._letterSpacing,
        this._textTop
      );
      this.dispose();

      this.texture = new THREE.Texture(this.canvas.canvas);
      this.texture.repeat.x = this.canvas.textWidth  / this.canvas.width;
      this.texture.repeat.y = this.canvas.textHeight / this.canvas.height;
      this.texture.offset.y = 1 - this.texture.repeat.y;
      this.texture.needsUpdate = true;

      if(this.material === undefined) {
        this.material = new THREE.SpriteMaterial({
          map: this.texture,
          depthTest: false,
          depthWrite: false
        });
      } else {
        this.material.map = this.texture;
      }

      if(this.sprite === undefined) {
        this.sprite   = new THREE.Sprite(this.material);
        this.add(this.sprite);
      }

      this.sprite.position.x = (this.canvas.textWidth /2/dpr);
      this.sprite.position.y = (this.canvas.textHeight/2/dpr);
      this.sprite.scale.set(this.canvas.textWidth/dpr, this.canvas.textHeight/dpr, 1);
    }

    // Getters

    get color() {
      return this._color;
    }

    get font() {
      return this._font;
    }

    get fontSize() {
      return this._fontSize;
    }

    get letterSpacing() {
      return this._letterSpacing;
    }

    get lineHeight() {
      return this.canvas.lineHeight;
    }

    get text() {
      return this._text;
    }

    get textTop() {
      return this._textTop;
    }

    get weight() {
      return this._weight;
    }

    // Setters

    set color(value) {
      this._color = value;
      this.update();
    }

    set font(value) {
      this._font = value;
      this.update();
    }

    set fontSize(value) {
      this._fontSize = value;
      this.update();
    }

    set letterSpacing(value) {
      this._letterSpacing = value;
      this.update();
    }

    set lineHeight(value) {
      this.canvas.lineHeight = value;
      this.update();
    }

    set text(value) {
      this._text = value;
      this.update();
    }

    set textTop(value) {
      this._textTop = value;
      this.update();
    }

    set weight(value) {
      this._weight = value;
      this.update();
    }
  }

  //////////////////////////////////////////////////
  // Canvas

  class CanvasText {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.textWidth  = 0;
      this.textHeight = 0;
      this.lineHeight = 30;
      this.totalLines = 0;
      this.textAlign = 'left';
      this.textBaseline = 'top';
    }

    draw(text, font, fontSize, weight, fill, letterSpacing, textTop) {
      const lSpacing = letterSpacing * dpr;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let ctxFont = weight + ' ' + (fontSize * dpr).toString() + 'px ' + font;
      this.ctx.font = ctxFont;

      let lines = text.split('\n');
      this.totalLines = lines.length;
      let textW = 0;
      lines.forEach(line => {
        let wid = getLineWidth(line, lSpacing, this.ctx);
        textW = Math.max(textW, wid);
      });

      this.textWidth  = Math.floor(textW * dpr);
      this.textHeight = Math.floor(((this.totalLines * this.lineHeight) + textTop) * dpr);
      this.textWidth  = Math.max(32, this.textWidth);
      this.textHeight = Math.max(32, this.textHeight);

      this.canvas.width  = THREE.Math.nextPowerOfTwo(this.textWidth);
      this.canvas.height = THREE.Math.nextPowerOfTwo(this.textHeight);

      this.ctx.font = ctxFont;
      this.ctx.fillStyle = fill;
      this.ctx.textAlign = this.textAlign;
      this.ctx.textBaseline = this.textBaseline;
      for(let i = 0; i < this.totalLines; ++i) {
        let txt = lines[i];
        let yPos = ((i * this.lineHeight) + textTop) * dpr;
        let spacing = getWordSpacing(txt, lSpacing, this.ctx);
        let letters = txt.split('');
        let n, nTotal = letters.length;
        for(n = 0; n < nTotal; ++n) {
          let letter = letters[n];
          this.ctx.fillText(letter, spacing.pos[n], yPos);
        }
      }
    }

    get width() {
      return this.canvas.width;
    }

    get height() {
      return this.canvas.height;
    }
  }

  function getLineWidth(line, spacing, ctx) {
    let words = line.split('');
    let totalWidth = 0;
    let i, total = words.length, iTotal = total-1;
    if(total > 0) {
      for(i = 0; i < total; ++i) {
        totalWidth += getWordSpacing(words[i], spacing, ctx).width;
        if(i < iTotal) {
          totalWidth += spacing;
        }
      }
    }
    return totalWidth;
  }

  function getWordSpacing(word, spacing, ctx) {
    let letters = word.split('');
    let letterPos = [];
    let i, total = letters.length, iTotal = total-1;

    let totalWidth = 0;
    if(total > 0) {
      letterPos.push(0);
      totalWidth = Math.ceil(ctx.measureText(letters[0]).width);
      for(i = 1; i < total; ++i) {
        letterPos.push(totalWidth + spacing);

        let letter = letters[i];
        let wid = Math.ceil(ctx.measureText(letter).width);
        if(i < iTotal) wid += spacing;
        totalWidth += wid;
      }
    }
    return {
      pos: letterPos,
      width: totalWidth
    };
  }
  
  //////////////////////////////////////////////////
  // Layer
  
  class THREETextLayer extends THREELayer {
    constructor(json, timeline) {
      super(json, timeline);

      this.mesh = new THREE.Object3D();
      this.item.add(this.mesh);
      
      var content = json.content;
      var fontSize = content.fontSize * window.devicePixelRatio;
      var fColor = getHex(content.fillColor[0], content.fillColor[1], content.fillColor[2]);
      var tColor = new THREE.Color(fColor);
      var color = '#' + tColor.getHexString();
      var weight = content.weight === 'regular' ? 'normal' : content.weight;
      
      this.tText = new THREEText(content.text, {
        color: color,
        font: content.font,
        fontSize: fontSize,
        weight: weight,
        letterSpacing: content.spacing,
        lineHeight: fontSize
      });
      this.tText.name = 'tText';
      this.mesh.add(this.tText);

      THREELayer.transform(this.item, this.mesh, json.transform, timeline);
      
      content.timeline.forEach((ani) => {
        if(ani.name === 'text') {
          THREELayer.animate(this, 'text', timeline, ani);
        }
      });
    }

    // Getters

    get text() {
      return this.tText.text;
    }

    // Setters

    set text(value) {
      this.tText.text = value;
    }
  }

  return {
    CanvasText: CanvasText,
    THREEText: THREEText,
    THREETextLayer: THREETextLayer
  };
}
