import DOM      from 'apollo-utils/DOMUtil';
import Event    from 'apollo-utils/Event';
import Timer    from 'apollo-timeline/Timer';

export default class AppRunner {
    
    constructor() {
        this.timer = new Timer();
        this.timer.listen(Event.UPDATE, this.updateHandler.bind(this));
    }
    
    setup() {}
    
    update() {}
    
    draw() {}
    
    updateHandler() {
        this.update();
        this.draw();
    }
    
    play() {
        this.timer.play();
    }
    
    pause() {
        this.timer.pause();
    }
    
    get running() {
        return this.timer.running;
    }
    
    get seconds() {
        return this.timer.seconds;
    }
    
}