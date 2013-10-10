# Pong.js

> Configurable JavaScript Pong game in the browser.
> Uses [Pixi.js](https://github.com/GoodBoyDigital/pixi.js) for rendering.
> Available stand-alone or as npm module for [Browserify](http://browserify.org/)

![Screenshot](http://oi39.tinypic.com/10hr1hf.jpg)

# Live examples

* [Player vs Bot »](http://kanocomputing.github.io/Pong.js/examples/player-vs-bot.html)
* [Player vs Player »](http://kanocomputing.github.io/Pong.js/examples/player-vs-player.html)
* [Bot vs Bot »](http://kanocomputing.github.io/Pong.js/examples/bot-vs-bot.html)
* [Random balls »](http://kanocomputing.github.io/Pong.js/examples/random-balls.html)
* [Custom colors »](http://kanocomputing.github.io/Pong.js/examples/custom-colors.html)
* [Random colors »](http://kanocomputing.github.io/Pong.js/examples/random-colors.html)
* [Shrink player »](http://kanocomputing.github.io/Pong.js/examples/shrink-player.html)
* [Framed »](http://kanocomputing.github.io/Pong.js/examples/framed.html)

# Usage

### Simple Example Usage

```javascript

var pong = new Pong(document.getElementById('wrapper'));

// Add keyboard controls for player A
pong.players.a.addControls({
	'up': 'w',
	'down': 's',
});

// Add behaviour for player B
pong.events.on('update', function () {

	if (pong.players.b.y < pong.balls[0].y) {
		pong.players.b.move(1);
	} else if (pong.players.b.y > pong.balls[0].y) {
		pong.players.b.move(-1);
	}

});
```

### Browserify Example Usage

#### Installation

`npm install pong.js`

#### Example

```javascript

var pong = require('pong.js');


// Add keyboard controls for player A
pong.players.a.addControls({
	'up': 'w',
	'down': 's',
});

// Add behaviour for player B
pong.events.on('update', function () {

	if (pong.players.b.y < pong.balls[0].y) {
		pong.players.b.move(1);
	} else if (pong.players.b.y > pong.balls[0].y) {
		pong.players.b.move(-1);
	}

});

```

# Development

### Global Dependencies

* Browserify `npm install -g browserify`
* Watchify `npm install -g watchify`

### Install

```
git clone git@github.com:KanoComputing/Pong.js.git
cd Pong.js
npm install
```

### Build

`npm run build`

### Watch

`npm run watch`

# Docs

## Pong class

#### Methods

* `start()` - Start game
* `stop()` - Stop game
* `update()` - Run next frame in the gameloop
* `updateIfStill()` - Only update if gameloop not running
* `resize()` - Resize accordingly to wrapper size. Use for responsive implementations
* `reset()` - Reset paddles positions, scores and balls
* `setBackgroundColor([ string ]) - Set background color using hexa string (`#xxxxxx`)
* `setLinesColor([ string ])` - Set lines color using hexa string (`#xxxxxx`)
* `setTextStyle([ object ])` - Set text style attributes (E.g. `font`, `fill`, `align`)
* `addBall()` - Add a ball to the game

#### Properties

* `events` - Game event emitter
* `players` - Object containing Players (`a` and `b` by default)
* `stage` - Pixi.js stage
* `renderer` - Pixi.js renderer
* `wrapper` - Wrapping DOM element
* `balls` - Array containing Ball objects
* `loop` - GameLoop object

## Player class

#### Methods

* `addControls([ object ])` - Add keyboard controls (E.g. `{ up: 'w', down: 's' }`)
* `move([ number ]) - Move up (`-1`) or down (`1`) according to speed at next iteration
* `screenX()` - Returns screen X position
* `screenY()` - Returns screen Y position
* `getBoundingBox()` - Returns paddle bounding box
* `reset()` - Reset player position
* `addPoint()` - Increse player score
* `setHeight([ number ])` - Set paddle height
* `setColor([ string ])` - Set paddle color using hexa string (`#xxxxxx`)

#### Properties

* `side` - `left` or `right`
* `width` - Paddle screen width
* `height` - Paddle screen height
* `speed` - Player speed per second (300 by default)
* `y` - game Y position
* `score` - Player score
* `color` - Octal color string

## Ball class

#### Methods

* `setSize([ number ])` - Set ball radius in pixels
* `setColor([ string ])` - Set ball color using hexa string (`#xxxxxx`)

#### Properties

* `color` - Octal color string
* `size` - Ball radius in pixels
* `velocity` - Object containing X and Y velocity
