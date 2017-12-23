'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DOMUtil = require('apollo-utils/DOMUtil');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (THREE) {
  var THREELayer = require('./THREELayer')(THREE);

  var dpr = window.devicePixelRatio;

  var TextAlign = {
    LEFT_BOTTOM: new THREE.Vector2(1.0, 1.0),
    CENTER_BOTTOM: new THREE.Vector2(0.5, 1.0),
    RIGHT_BOTTOM: new THREE.Vector2(0.0, 1.0),
    LEFT_CENTER: new THREE.Vector2(1.0, 0.5),
    CENTER_CENTER: new THREE.Vector2(0.5, 0.5),
    RIGHT_CENTER: new THREE.Vector2(0.0, 0.5),
    LEFT_TOP: new THREE.Vector2(1.0, 0.0),
    CENTER_TOP: new THREE.Vector2(0.5, 0.0),
    RIGHT_TOP: new THREE.Vector2(0.0, 0.0)
  };

  var THREEText = function (_THREE$Object3D) {
    _inherits(THREEText, _THREE$Object3D);

    function THREEText(text, options) {
      _classCallCheck(this, THREEText);

      var _this = _possibleConstructorReturn(this, (THREEText.__proto__ || Object.getPrototypeOf(THREEText)).call(this));

      _this.canvas = new CanvasText();
      _this._text = '';
      _this._color = '#FFFFFF';
      _this._font = 'Arial';
      _this._fontSize = 30;
      _this._weight = 'normal';
      _this._spacing = 20;
      _this._textTop = 0;
      _this._align = TextAlign.LEFT_BOTTOM;
      _this.texture = undefined;
      _this.material = undefined;
      _this.sprite = undefined;

      if (options !== undefined) {
        if (options.align !== undefined) _this.align = options.align;
        if (options.color !== undefined) _this._color = options.color;
        if (options.font !== undefined) _this._font = options.font;
        if (options.fontSize !== undefined) _this._fontSize = options.fontSize;
        if (options.weight !== undefined) _this._weight = options.weight;
        if (options.textTop !== undefined) _this._textTop = options.textTop;
        if (options.spacing !== undefined) {
          _this._spacing = options.spacing;
        }
        if (options.lineHeight !== undefined) {
          _this.canvas.lineHeight = options.lineHeight;
        }
      }

      _this.text = text;
      return _this;
    }

    _createClass(THREEText, [{
      key: 'dispose',
      value: function dispose() {
        if (this.texture !== undefined) {
          this.texture.dispose();
          this.texture = undefined;
        }
      }
    }, {
      key: 'update',
      value: function update() {
        this.canvas.draw(this._text, this._font, this._fontSize, this._weight, this._color, this._spacing, this._textTop);
        this.dispose();

        this.texture = new THREE.Texture(this.canvas.canvas);
        this.texture.repeat.x = this.canvas.textWidth / this.canvas.width;
        this.texture.repeat.y = this.canvas.textHeight / this.canvas.height;
        this.texture.offset.y = 1 - this.texture.repeat.y;
        this.texture.needsUpdate = true;

        if (this.material === undefined) {
          this.material = new THREE.SpriteMaterial({
            map: this.texture,
            depthTest: false,
            depthWrite: false
          });
        } else {
          this.material.map = this.texture;
        }

        if (this.sprite === undefined) {
          this.sprite = new THREE.Sprite(this.material);
          this.add(this.sprite);
        }

        this.sprite.position.x = this.canvas.textWidth / 2 / dpr * this._align.x;
        this.sprite.position.y = (this.canvas.textHeight / 2 / dpr * this._align.y - 20 - this._fontSize / dpr) * -1;
        this.sprite.scale.set(this.canvas.textWidth / dpr, this.canvas.textHeight / dpr, 1);
      }
    }, {
      key: 'align',
      get: function get() {
        return this._align;
      },
      set: function set(value) {
        if (typeof value === 'string') {
          switch (value) {
            case 'left':
              this._align = TextAlign.LEFT_BOTTOM;
              break;

            case 'center':
              this._align = TextAlign.CENTER_BOTTOM;
              break;

            case 'right':
              this._align = TextAlign.RIGHT_BOTTOM;
              break;
          }
        } else {
          this._align = value;
        }
        this.update();
      }
    }, {
      key: 'color',
      get: function get() {
        return this._color;
      },
      set: function set(value) {
        this._color = value;
        this.update();
      }
    }, {
      key: 'font',
      get: function get() {
        return this._font;
      },
      set: function set(value) {
        this._font = value;
        this.update();
      }
    }, {
      key: 'fontSize',
      get: function get() {
        return this._fontSize;
      },
      set: function set(value) {
        this._fontSize = value;
        this.update();
      }
    }, {
      key: 'spacing',
      get: function get() {
        return this._spacing;
      },
      set: function set(value) {
        this._spacing = value;
        this.update();
      }
    }, {
      key: 'lineHeight',
      get: function get() {
        return this.canvas.lineHeight;
      },
      set: function set(value) {
        this.canvas.lineHeight = value;
        this.update();
      }
    }, {
      key: 'text',
      get: function get() {
        return this._text;
      },
      set: function set(value) {
        this._text = value;
        this.update();
      }
    }, {
      key: 'textTop',
      get: function get() {
        return this._textTop;
      },
      set: function set(value) {
        this._textTop = value;
        this.update();
      }
    }, {
      key: 'weight',
      get: function get() {
        return this._weight;
      },
      set: function set(value) {
        this._weight = value;
        this.update();
      }
    }, {
      key: 'width',
      get: function get() {
        return this.canvas.textWidth;
      }
    }, {
      key: 'height',
      get: function get() {
        return this.canvas.textHeight;
      }
    }]);

    return THREEText;
  }(THREE.Object3D);

  var MIN_CANVAS_SIZE = 64;

  var CanvasText = function () {
    function CanvasText() {
      _classCallCheck(this, CanvasText);

      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.textWidth = 0;
      this.textHeight = 0;
      this.lineHeight = 30;
      this.totalLines = 0;
      this.textAlign = 'left';
      this.textBaseline = 'top';
    }

    _createClass(CanvasText, [{
      key: 'draw',
      value: function draw(text, font, fontSize, weight, fill, spacing, textTop) {
        var _this2 = this;

        var lSpacing = spacing * dpr;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var ctxFont = weight + ' ' + (fontSize * dpr).toString() + 'px ' + font;
        this.ctx.font = ctxFont;

        var lines = text.split('\n');
        this.totalLines = lines.length;
        var textW = 0;
        lines.forEach(function (line) {
          var wid = getLineWidth(line, lSpacing, _this2.ctx);
          textW = Math.max(textW, wid);
        });

        this.textWidth = Math.floor(textW * dpr);
        this.textHeight = Math.floor((this.totalLines * this.lineHeight + textTop) * dpr);
        this.textWidth = Math.max(MIN_CANVAS_SIZE, this.textWidth);
        this.textHeight = Math.max(MIN_CANVAS_SIZE, this.textHeight + 32);

        this.canvas.width = THREE.Math.ceilPowerOfTwo(this.textWidth);
        this.canvas.height = THREE.Math.ceilPowerOfTwo(this.textHeight);

        this.ctx.font = ctxFont;
        this.ctx.fillStyle = fill;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        for (var i = 0; i < this.totalLines; ++i) {
          var txt = lines[i];
          var yPos = (i * this.lineHeight - textTop) * dpr;
          var _spacing = getWordSpacing(txt, lSpacing, this.ctx);
          var letters = txt.split('');
          var n = void 0,
              nTotal = letters.length;
          for (n = 0; n < nTotal; ++n) {
            var letter = letters[n];
            this.ctx.fillText(letter, _spacing.pos[n], yPos);
          }
        }
      }
    }, {
      key: 'width',
      get: function get() {
        return this.canvas.width;
      }
    }, {
      key: 'height',
      get: function get() {
        return this.canvas.height;
      }
    }]);

    return CanvasText;
  }();

  function getLineWidth(line, spacing, ctx) {
    var words = line.split('');
    var totalWidth = 0;
    var i = void 0,
        total = words.length,
        iTotal = total - 1;
    if (total > 0) {
      for (i = 0; i < total; ++i) {
        totalWidth += getWordSpacing(words[i], spacing, ctx).width;
        if (i < iTotal) {
          totalWidth += spacing;
        }
      }
    }
    return totalWidth;
  }

  function getWordSpacing(word, spacing, ctx) {
    var letters = word.split('');
    var letterPos = [];
    var i = void 0,
        total = letters.length,
        iTotal = total - 1;

    var totalWidth = 0;
    if (total > 0) {
      letterPos.push(0);
      totalWidth = Math.ceil(ctx.measureText(letters[0]).width);
      for (i = 1; i < total; ++i) {
        letterPos.push(totalWidth + spacing);

        var letter = letters[i];
        var wid = Math.ceil(ctx.measureText(letter).width);
        if (i < iTotal) wid += spacing;
        totalWidth += wid;
      }
    }
    return {
      pos: letterPos,
      width: totalWidth
    };
  }

  var THREETextLayer = function (_THREELayer) {
    _inherits(THREETextLayer, _THREELayer);

    function THREETextLayer(json, timeline) {
      _classCallCheck(this, THREETextLayer);

      var _this3 = _possibleConstructorReturn(this, (THREETextLayer.__proto__ || Object.getPrototypeOf(THREETextLayer)).call(this, json, timeline));

      _this3.mesh = new THREE.Object3D();
      _this3.item.add(_this3.mesh);

      var content = json.content;
      var fontSize = content.fontSize * window.devicePixelRatio;
      var fColor = (0, _DOMUtil.getHex)(content.color[0], content.color[1], content.color[2]);
      var tColor = new THREE.Color(fColor);
      var color = '#' + tColor.getHexString();
      var weight = content.weight === 'regular' ? 'normal' : content.weight;

      _this3.tText = new THREEText(content.text, {
        align: content.align,
        color: color,
        font: content.font,
        fontSize: fontSize,
        weight: weight,
        spacing: content.spacing,
        lineHeight: fontSize
      });
      _this3.tText.name = 'tText';
      _this3.mesh.add(_this3.tText);

      THREELayer.transform(_this3.item, _this3.mesh, json.transform, timeline);

      content.timeline.forEach(function (ani) {
        if (ani.name === 'text') {
          THREELayer.animate(_this3, 'text', timeline, ani);
        }
      });
      return _this3;
    }

    _createClass(THREETextLayer, [{
      key: 'text',
      get: function get() {
        return this.tText.text;
      },
      set: function set(value) {
        this.tText.text = value;
      }
    }]);

    return THREETextLayer;
  }(THREELayer);

  return {
    TextAlign: TextAlign,
    CanvasText: CanvasText,
    THREEText: THREEText,
    THREETextLayer: THREETextLayer
  };
};