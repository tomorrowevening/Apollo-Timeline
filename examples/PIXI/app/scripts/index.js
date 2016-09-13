import DOM from 'apollo-utils/DOMUtil';
import Loader from 'apollo-utils/Loader';
import Config from './models/Config';
import Application from './controllers/Application';

window.app = undefined;

window.onload = function() {
    window.app = new Application();
    window.app.setup();
    
    let elLoader = DOM.id("loader");
    Loader.loadAssets(
        Config.files,
        function() {
            console.log("Loaded:", Loader)
            Config.atlas = Loader.json.atlas;
            
            elLoader.style.width = "100%";
            elLoader.style.opacity = 0;
            
            DOM.delay(0.5, function() {
                elLoader.parentNode.removeChild(elLoader);
                window.app.play();
                window.app.begin();
            })
        },
        function(progress) {
            elLoader.style.width = (progress*100).toFixed(1) + "%";
        }
    );
};
