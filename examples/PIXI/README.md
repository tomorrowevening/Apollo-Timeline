# Apollo PIXI-Runtime

PixiJS is a 2D WebGL renderer, so keep in mind this restricts positioning Z, and rotating X & Y.

### Usage

Open terminal

`cd PIXI`

`npm install`

`gulp`


### Testing

In `Application.js`, you'll find a boolean called `cycleCompositions`.

Enabling to true cycles through all the exported Compositions, playing them twice before moving to the next Composition.

Setting to false builds the Default Composition set in `project.json`
