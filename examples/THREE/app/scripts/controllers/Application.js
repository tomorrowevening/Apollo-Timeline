import AppRunner from './AppRunner';
import Config from '../models/Config';
import DOM from 'apollo-utils/DOMUtil';
import Loader from 'apollo-utils/Loader';
var THREE = require('three');
import THREEComposition from '../three/THREEComposition';

export default class Application extends AppRunner {
    
    renderer    = undefined;
    stage       = undefined;
    composition = undefined;
    ui          = undefined;
    
    constructor() {
        super();
    }
    
    setup() {
        let canvas    = DOM.id("world");
        this.renderer = new THREE.WebGLRenderer({
            'canvas'   : canvas,
            'alpha'    : false,
            'antialias': true,
            'depth'    : true
        });
        this.renderer.autoClear         = false;
        this.renderer.sortObjects       = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap; // THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap
        this.renderer.setClearColor( 0x111111 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        
        this.buildUI();
        
        this.resize();
        DOM.listen( window, "resize", this.resize.bind(this) );
    }
    
    begin() {
        console.log("Config:", Config)
        /**
         * Do you want to sample all the exported compositions or only the default?
         */
        const cycleCompositions = false;
        
        if(cycleCompositions) {
            const me = this;
            const json = Loader.json.project.compositions;
            let compNames = [];
            for(let name in json) compNames.push(name);
            let index = 0, total = compNames.length;
            console.log( "Compositions:", total, compNames.join(", ") );
            
            function showComp() {
                let compName = compNames[index];
                me.buildComp( compName );
                
                DOM.delay(me.composition.duration*2, showComp);
                timestamp = Date.now();
                
                 // next comp
                index = (index+1) % total;
            }
            
            showComp();
        } else {
            this.buildComp( "images" );
            // this.buildComp( Loader.json.project.defaultComp );
        }
    }
    
    buildUI() {
    }
    
    buildComp(name) {
        let json  = Loader.json.project.compositions[ name ];
        if(json === undefined) return; // doesn't exist
        
        console.log("Comp:", name);
        
        // Remove previous comp
        if(this.composition !== undefined) {
            this.composition.dispose();
            delete this.composition;
            this.composition = undefined;
        }
        
        // Add new comp
        let atlas = Loader.json.atlas.compositions[ name ];
        this.composition = new THREEComposition( json, this.renderer );
        this.composition.build(json);
        this.composition.buildAtlas(atlas);
        this.composition.play();
    }
    
    update() {
    }
    
    draw() {
        this.renderer.clear();
        if(this.composition !== undefined) {
            this.composition.draw();
        }
    }
    
    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
}