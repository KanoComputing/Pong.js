
# Global Dependencies

* Browserify `npm install -g browserify`
* Watchify `npm install -g watchify`

# Install

`npm install`

# Build

`npm run build`

# Build

`npm run watch`

# Simple Usage

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

# Width Browserify

#### Installation

`npm install pong.js`

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

## Pong



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

## Player

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

## Ball

#### Methods

* `setSize([ number ])` - Set ball radius in pixels
* `setColor([ string ])` - Set ball color using hexa string (`#xxxxxx`)

#### Properties

* `color` - Octal color string
* `size` - Ball radius in pixels
* `velocity` - Object containing X and Y velocity
