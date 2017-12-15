import { listen, ignore } from 'apollo-utils/DOMUtil';
import Debug from 'apollo-utils/Debug';
import LoadBar from './views/LoadBar';
// import PixiApp from './apps/PixiApp';
import ThreeApp from './apps/ThreeApp';

let loader, app = undefined;

const apps = {
  removeApp: function() {
    if(app !== undefined) {
      app.dispose();
      app = undefined;
    }
  },
  pixi: function() {
    console.log('PixiApp');
    this.removeApp();
    
    // app = new PixiApp();
    // app.setup();
    // app.play();
    // app.resize();
  },
  three: function() {
    console.log('ThreeApp');
    this.removeApp();
    
    app = new ThreeApp();
    app.setup();
    app.play();
    app.resize();
  }
};

function beginLoad(evt) {
  ignore(document, 'DOMContentLoaded', beginLoad);
  
  // Load everything
  loader = new LoadBar();
  loader.listen(LoadBar.COMPLETE, loadComplete);
  loader.startLoad();
}

function loadComplete(evt) {
  loader.ignore(LoadBar.COMPLETE, loadComplete);
  loader = undefined;
  
  Debug.init();
  // Debug.gui.add(apps, 'pixi');
  Debug.gui.add(apps, 'three');
}

listen(document, 'DOMContentLoaded', beginLoad);
