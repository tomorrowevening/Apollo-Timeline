import AppRunner from './AppRunner';
import DOM from 'apollo-utils/DOMUtil';
import Loader from 'apollo-utils/Loader';
import PIXI from 'pixi.js';

export default class Application extends AppRunner {
    
    renderer    = undefined;
    stage       = undefined;
    composition = undefined;
    
    constructor() {
        super();
    }
    
    setup() {
        const scale   = window.devicePixelRatio;
        const width   = window.innerWidth;
        const height  = window.innerHeight;
        let canvas    = DOM.id("world");
        this.renderer = new PIXI.WebGLRenderer(width*scale, height*scale, {
            view: canvas,
            backgroundColor: 0x111111,
            antialias: true
        });
        canvas.style.width  = width.toString()  + "px";
        canvas.style.height = height.toString() + "px";
        
        this.stage = new PIXI.Container();
        
        DOM.listen( window, "resize", this.resize.bind(this) );
    }
    
    begin() {
    }
    
    update() {
    }
    
    draw() {
        this.renderer.render( this.stage );
    }
    
    resize() {
        const s = window.devicePixelRatio;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.resize(w*s, h*s);
        this.renderer.view.style.width  = w.toString() + "px";
        this.renderer.view.style.height = h.toString() + "px";
    }
    
}