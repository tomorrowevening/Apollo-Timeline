var PIXI = require('pixi.js');
import { BG_COLOR, canvas } from './global';

export const pixiApp  = new PIXI.Application({
  antialias: true,
  autoStart: false,
  resolution: 1,
  backgroundColor: BG_COLOR,
  view: canvas
});

export const renderer = pixiApp.renderer;
