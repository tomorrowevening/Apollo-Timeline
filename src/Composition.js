import Layer from './Layer';
import Timeline from './Timeline';
import { TIME } from 'apollo-utils/Timer';
import Marker from './Marker';

export default class Composition extends Layer {
  constructor(obj) {
    super(obj);

    this.layers = [];
    this.width = 0;
    this.height = 0;
    this.camera = undefined;

    this.timeline = new Timeline();
    if (obj.duration !== undefined) {
      this.timeline.duration = obj.duration;
    }
    if (obj.maxPlays !== undefined) {
      this.timeline.maxPlays = obj.maxPlays;
    }
    if (obj.mode !== undefined) {
      this.timeline.mode = obj.mode;
    }

    this.showing = this.start === 0;
  }

  dispose() {
    this.timeline.dispose();
    this.camera = undefined;
    this.layers.forEach((layer) => { layer.dispose(); })
    this.layers = [];
  }

  addLayer(layer) {
    layer.showing = this.start === 0 && layer.start === 0;
    this.layers.push(layer);
  }

  update(time, duration) {
    const d = duration !== undefined ? duration : this.timeline.duration;
    this.timeline.update(time, d);
    this.updateLayers(this.timeline.seconds, d);
  }

  updateLayers(time, duration) {
    let total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      let l = this.layers[i];
      let visible = l.showable(time);
      
      if (visible) {
        if (l instanceof Composition) {
          if (!l.showing && l.timeline.restartable) {
            l.play();
          }
          l.update(time - l.start, duration);
        } else {
          l.update(time - l.start, duration);
        }
      } else if (l.showing && l instanceof Composition) {
        if (l.timeline.playing && l.timeline.seconds > 0) {
          l.timeline.seconds = l.timeline.duration;

          if (l.timeline.time.speed < 0) {
            l.timeline.seconds = 0;
          }

          if ((l.timeline.maxPlays > 0 && l.timeline.timesPlayed >= l.timeline.maxPlays) || l.timeline.mode === 'once') {
            l.timeline.playing = false;
          }
        }
      }
      l.showing = visible;
    }
  }

  draw() {
    const time = this.seconds;
    let total = this.layers.length;
    for (let i = 0; i < total; ++i) {
      let l = this.layers[i];
      let visible = l.showable(time);
      if (visible) l.draw();
    }
  }

  play() {
    this.timeline.play();
    this.playLayers();
  }

  pause() {
    this.timeline.pause();
    this.pauseLayers();
  }

  playLayers() {
    const time = this.seconds;
    let i, l, total = this.layers.length;
    for (i = 0; i < total; ++i) {
      l = this.layers[i];
      if (i instanceof Composition && l.showable(time)) {
        l.play();
      }
    }
  }

  pauseLayers() {
    const time = this.seconds;
    let i, l, total = this.layers.length;
    for (i = 0; i < total; ++i) {
      l = this.layers[i];
      if (i instanceof Composition && l.playing) {
        l.pause();
      }
    }
  }

  resize(w, h) {
    this.layers.forEach(function(layer) {
      layer.resize(w, h);
    });
  }

  // Build

  build(json, parentComp) {
    this.name = json.name;
    this.width = json.width;
    this.height = json.height;
    if (parentComp !== undefined) {
      this.duration = this.timeline.duration = Math.min(this.duration, parentComp.duration);
    }

    let i, total;

    // Build markers
    total = json.markers.length;
    for (i = 0; i < total; ++i) {
      let m = json.markers[i];
      this.timeline.markers.push(new Marker(m.name, m.time, m.action));
    }

    // Build layers
    total = json.layers.length;
    for (i = total - 1; i > -1; --i) {
      let layer = this.buildLayer(json, json.layers[i]);
      if (layer !== undefined) this.layers.push(layer);
    }
  }

  buildAtlas(atlas) {
    if (atlas === undefined) return;

    if (atlas.settings !== undefined) {
      // Duration
      if (atlas.settings.duration !== undefined) {
        this.duration = this.timeline.duration = atlas.settings.duration;
      }

      // Mode
      if (atlas.settings.playMode !== undefined) {
        this.timeline.playMode = atlas.settings.playMode;
      }

      // Count
      if (atlas.settings.playCount !== undefined) {
        this.timeline.maxPlays = atlas.settings.playCount;
      }
    }
  }

  buildLayer(json, item) {
    let layer = new Layer(item.name, item.start, item.duration);

    // Create layer...
    switch (item.type) {
      case 'audio':
        layer = this.buildLayerAudio(json, item);
        break;
      case 'composition':
        layer = this.buildLayerComposition(json, item);
        break;
      case 'image':
        layer = this.buildLayerImage(json, item);
        break;
      case 'shape':
        layer = this.buildLayerShape(json, item);
        break;
      case 'text':
        layer = this.buildLayerText(json, item);
        break;
      case 'video':
        layer = this.buildLayerVideo(json, item);
        break;
    }

    layer.duration = Math.min(this.timeline.duration, item.duration);

    return layer;
  }

  buildLayerAudio(json, item) {
    let layer = new LayerAudio(item);
    return layer;
  }

  buildLayerComposition(json, item) {
    let layer = new Composition(item);
    layer.build(item, this);
    return layer;
  }

  buildLayerImage(json, item) {
    let layer = new LayerImage(item);
    return layer;
  }

  buildLayerShape(json, item) {
    let layer = new LayerShape(item);
    return layer;
  }

  buildLayerText(json, item) {
    let layer = new LayerText(item);
    return layer;
  }

  buildLayerVideo(json, item) {
    let layer = new LayerVideo(item);
    return layer;
  }

  // Getters

  getLayer(name) {
    let i, total = this.layers.length;
    for(i = 0; i < total; ++i) {
      let layer = this.layers[i];
      if(layer.name === name) {
        return layer;
      }
    }
    return undefined;
  }

  get seconds() {
    return this.timeline.seconds;
  }

  get playing() {
    return this.timeline.playing;
  }
  
  set seconds(value) {
    this.timeline.seconds = value;
  }
}