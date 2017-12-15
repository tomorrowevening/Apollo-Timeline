# Apollo Timeline

### An After Effects-inspired Timeline
Examples [can be seen here](http://experiments.tomorrowevening.com/timeline/)

After Effects project file [can be downloaded here](https://github.com/tomorrowevening/Apollo-Timeline/raw/master/examples/_animation/animations.aep) for comparison

##### Timeline
A Timeline is an object with keyframes, markers, and a timer. The timer updates the Timeline every time it's updated. Typically a Timeline has a set duration for synching/combining animations.

###### Playmodes
* **once** - Plays the Timeline once, then pauses the timeline
* **loop** - Keeps replaying the Timeline until *timesPlayed* reaches *maxPlays*
* **pingPong** - Plays the Timeline forwards and backwards


##### Keyframe
A Keyframe is an object that interpolates between 2 Arrays, *startValue* and *endValue*.
*autoOrigin* is used when a keyframe's *startValue* doesn't equal the object's current value when it begins.

###### Types
* **linear** - Linear interpolation from A to B
* **bezier** - Cubic Bezier interpolation from A to B
* **hold** - No interpolation from A to B until the Keyframe is complete


##### Marker
A Marker is time-based label with optional commands.
Current built-in actions are 'stop', which stops the timeline, and 'delay', which will pause the timeline for the set duration.

Jumps to the "idle" Marker
`timeline.goToMarker( "idle" );`

###### Commands
"stop" - Stops the Timeline

Stop the Timeline at 1 second

`timeline.addMarker( new Marker("Idle", 1.0, "stop") );`
