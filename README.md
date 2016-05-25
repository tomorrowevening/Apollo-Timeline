# Apollo Timeline

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

**This won't work properly**

`timeline.add( box, 'opacity', 1, 1, 0.0 );`
`timeline.add( box, 'opacity', 0, 1, 1.5 );`

**But this will**

`timeline.add( box, 'opacity', 1, 1, 0.0 );`
`timeline.add( box, 'opacity', 0, 1, 1.5 ).autoOrigin = true;`

The reason the top example won't work correctly is because when both Keyframes are added to the Timeline, their startValue equals the same (box.opacity). We can override that with this call, but it's not so pretty:
`timeline.add( box, 'opacity', 0, 1, 1.5, 0.25, 0.25, 0.75, 0.75, undefined, undefined, 1 );`


##### Marker
A Marker is time-based label with optional commands.

Jumps to the "Idle" Marker

`timeline.goToMarker( "Idle );`

###### Commands
"stop" - Stops the Timeline

Stop the Timeline at 1 second

`timeline.addMarker( new Marker("Idle", 1.0, "stop") );`

