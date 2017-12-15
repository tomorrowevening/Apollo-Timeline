import Debug from 'apollo-utils/Debug';
import AppRunner from 'apollo-utils/AppRunner';
import Loader from 'apollo-utils/Loader';
import TimelineConfig from '../../../../src/TimelineConfig';
import { output } from '../models/global';

export default class BaseApp extends AppRunner {
  constructor(params) {
    super();
    params = params || {};
    
    this.appFolder  = Debug.gui.addFolder('Apps');
    this.appNames   = params.apps !== undefined ? params.apps : [];
    this.appName    = '';
    this.comp       = undefined;
  }
  
  setup() {
    this.appFolder.add(this, 'appName', this.appNames).onChange((value) => {
      this.showComp(value);
    });
    
    // File sources
    for(let i in Loader.files) {
      TimelineConfig.files[i] = Loader.files[i].src;
    }
    
    // JSON
    for(let i in Loader.json) {
      TimelineConfig.json[i] = Loader.json[i];
    }
    
    // Images
    for(let i in Loader.images) {
      TimelineConfig.images[i] = Loader.images[i];
    }
    
    // Video
    for(let i in Loader.video) {
      TimelineConfig.video[i] = Loader.video[i];
    }
  }
  
  dispose() {
    Debug.gui.removeFolder('Apps');
    
    if(this.comp !== undefined) {
      this.comp.dispose();
      this.comp = undefined;
    }
  }
  
  update() {
    if(this.comp !== undefined) {
      this.comp.update();
      let time = this.comp.seconds;
      let duration = this.comp.duration;
      let speed = this.comp.timeline.speed.toFixed(1);
      let seconds = time.toFixed(2) + ' / ' + duration.toFixed(2);
      let frames = Math.round(time * 60).toString() + ' / ' + Math.round(duration * 60).toString();
      
      // loop: 1.0 (2 / 4)
      // 2.5 / 5.0: 150 / 300
      let extra = '';
      if(this.comp.timeline.maxPlays > 0) {
        let played = this.comp.timeline.timesPlayed.toString();
        let totalPlays = this.comp.timeline.maxPlays.toString();
        extra = ' (' + played + ' / ' + totalPlays + ')';
      }
      output.mode.innerHTML = this.comp.timeline.mode + ': ' + speed + extra;
      output.time.innerHTML = frames + ': ' + seconds;
      bar.style.width = ((time / duration) * 100).toFixed(2) + '%';
    }
  }
  
  draw() {
    if(this.comp !== undefined) {
      this.comp.draw();
    }
  }
  
  updateHandler() {
    this.update();
    
    Debug.begin();
    this.draw();
    Debug.end();
  }
  
  resize(evt) {
    if(this.comp !== undefined) {
      this.comp.resize(window.innerWidth, window.innerHeight);
    }
  }
  
  // Animation
  showComp(name) {
    if(this.comp !== undefined) {
      this.comp.dispose();
      this.comp = undefined;
    }
    console.log('showComp:', name);
  }
}
