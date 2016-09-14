import AppRunner from './AppRunner';
import DOM from 'apollo-utils/DOMUtil';
import Loader from 'apollo-utils/Loader';
import PIXI from 'pixi.js';
import PIXIComposition from '../pixi/PIXIComposition';

let timestamp       = 0;

export default class Application extends AppRunner {
    
    renderer    = undefined;
    stage       = undefined;
    composition = undefined;
    ui          = undefined;
    
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
        this.buildUI();
        
        this.resize();
        DOM.listen( window, "resize", this.resize.bind(this) );
    }
    
    begin() {const me = this;
        const json = Loader.json.project.compositions;
        let compNames = [];
        for(let name in json) compNames.push(name);
        let index = 0, total = compNames.length;
        console.log( "Compositions:", total, compNames.join(", ") );
        
        function showComp() {
            let compName = compNames[index];
            console.log(">> Show comp", compName, index);
            me.buildComp( compName );
            
            DOM.delay(me.composition.duration*2, showComp);
            timestamp = Date.now();
            
             // next comp
            index = (index+1) % total;
        }
        
        showComp();
    }
    
    buildUI() {
        const scale = window.devicePixelRatio;
        const width = window.innerWidth;
        this.ui = new PIXI.Container();
        this.stage.addChild( this.ui );
        
        const bgHeight = 20;
        
        let timeline = new PIXI.Graphics();
        timeline.beginFill(0xffffff, 0.2);
        timeline.drawRect(0, -bgHeight*scale, width*2*scale, bgHeight*scale);
        timeline.endFill();
        this.ui.addChild(timeline);
        
        this.ui.bg = new PIXI.Graphics();
        this.ui.bg.beginFill(0xffffff, 1);
        this.ui.bg.drawRect(0, -bgHeight*scale, width*scale, bgHeight*scale);
        this.ui.bg.endFill();
        
        this.ui.text = new PIXI.Text("BLAH BLAH BLAH", {
            fontFamily  : "Helvetica",
            fontSize    : 18*scale,
            fill        : 0x111111
        });
        this.ui.text.position.x =  10*scale;
        this.ui.text.position.y = -20*scale;
        
        this.ui.addChild( this.ui.bg );
        this.ui.addChild( this.ui.text );
    }
    
    buildComp(name) {
        let json  = Loader.json.project.compositions[ name ];
        if(json === undefined) return; // doesn't exist
        
        // Remove previous comp
        if(this.composition !== undefined) {
            this.composition.dispose();
            delete this.composition;
            this.composition = undefined;
        }
        
        this.ui.text.text = name.toUpperCase();
        
        // Add new comp
        let atlas = Loader.json.atlas.compositions[ name ];
        this.composition = new PIXIComposition( json, this.renderer );
        this.stage.addChildAt( this.composition.item, 0 );
        this.composition.build(json);
        this.composition.buildAtlas(atlas);
        this.composition.play();
    }
    
    update() {
        if(this.composition === undefined) return;
        
        const now = Date.now();
        const elapsed = (now - timestamp) / 1000;
        const total = this.composition.duration*2;
        const percent = Math.min(elapsed / total, 1);
        this.ui.bg.width = percent * window.innerWidth * window.devicePixelRatio;
        
        let copy = this.composition.name.toUpperCase() + ": ";
        copy += this.composition.timeline.seconds.toFixed(2) + " / " + this.composition.duration.toFixed(2)
        this.ui.text.text = copy;
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
        this.ui.position.y = h*s;
    }
    
}