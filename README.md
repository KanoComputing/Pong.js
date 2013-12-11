# Pong.js

> Configurable JavaScript Pong game in the browser.
> Uses [Pixi.js](https://github.com/GoodBoyDigital/pixi.js) for rendering.
> Available stand-alone or as npm module for [Browserify](http://browserify.org/)

![Screenshot](http://oi39.tinypic.com/10hr1hf.jpg)

# Live examples

* [Player vs Bot »](http://kanocomputing.github.io/Pong.js/examples/player-vs-bot.html)
* [Player vs Player »](http://kanocomputing.github.io/Pong.js/examples/player-vs-player.html)
* [Bot vs Bot »](http://kanocomputing.github.io/Pong.js/examples/bot-vs-bot.html)
* [Custom ball »](http://kanocomputing.github.io/Pong.js/examples/custom-ball.html)
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
pong.on('update', function () {

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

var Pong = require('pong.js'),
	pong = new Pong(document.getElementById('wrapper'));


// Add keyboard controls for player A
pong.players.a.addControls({
	'up': 'w',
	'down': 's',
});

// Add behaviour for player B
pong.on('update', function () {

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
* `pause()` - Pause game (Showing pause screen)
* `resume()` - Resume paused game
* `togglePaused()` - Pause or resume game
* `refresh()` - Re-render screen
* `update()` - Run next frame in the gameloop
* `updateIfStill()` - Only update if gameloop not running
* `resize()` - Resize accordingly to wrapper size. Use for responsive implementations
* `resetBalls( add_one )` - Remove all balls, add one if `true` is passed
* `restart()` - Reset position of players and ball
* `reset()` - Reset game (Restore start screen, scores, ..)
* `setBackgroundColor( string )` - Set background color using hexa string (`#xxxxxx`)
* `setLinesColor( string )` - Set lines color using hexa string (`#xxxxxx`)
* `setTextStyle( object )` - Set text style attributes (E.g. `font`, `fill`, `align`)
* `setBallColor( string )` - Set the color of balls currently on stage and future ones
* `setBallSize( number )` - Set the size of balls currently on stage and future ones
* `setBallSpeed( number )` - Set the speed of balls currently on stage and future ones
* `addBall()` - Add a ball to the game
* `on( event , callback )` - Bind callback to a game event
* `emit( event , [ params.. ])` - Emit a game event
* `win( string )` - Stops game, display message to screen

#### Properties

* `events` - Game event emitter
* `players` - Object containing Players (`a` and `b` by default)
* `stage` - Pixi.js stage
* `renderer` - Pixi.js renderer
* `wrapper` - Wrapping DOM element
* `balls` - Array containing Ball objects
* `loop` - GameLoop object
* `bounces` - Number of ball bounces since last point
* `totalBounces` - Number of ball bounces since the start of the current game
* `hits` - Number of times a player hit the ball since last point
* `totalHits` - Number of times a player hit the ball since the start of the current game

#### Events

* `start` - Triggered when game is started
* `stop` - Triggered when game is stopped
* `pause` - Triggered when game is paused
* `resume` - Triggered when game is resumed
* `beforeupdate` - Triggered before every gameloop iteration
* `update` - Triggered after every gameloop iteration
* `resize` - Triggered when the game is resized
* `point` - Triggered by every player when a point is scored
* `setLinesColor` - Used by UI children, triggered when `.setLinesColor` is called
* `setTextStyle` - Used by UI children, triggered when `.setTextStyle` is called
* `setBallColor` - Used by Ball instances, triggered when `.setBallColor` is called
* `setBallSize` - Used by Ball instances, triggered when `.setBallSize` is called
* `setBallSpeed` - Used by Ball instances, triggered when `.setBallSpeed` is called
* `bounce` - Fired every time a ball bounces
* `hit` - Fired every time a ball hits a player

## Player class

#### Methods

* `addControls( object )` - Add keyboard controls (E.g. `{ up: 'w', down: 's' }`)
* `move( number )` - Move up (`-1`) or down (`1`) according to speed at next iteration
* `screenX()` - Returns screen X position
* `screenY()` - Returns screen Y position
* `getBoundingBox()` - Returns paddle bounding box
* `reset()` - Reset player position
* `addPoint()` - Increse player score
* `setHeight( number )` - Set paddle height
* `setY( number )` - Set player Y position
* `setColor( string )` - Set paddle color using hexa string (`#xxxxxx`)
* `on( event, callback )` - Bind callback to a player event
* `emit( event , [ params.. ])` - Emit a player event

#### Events

* `point` - Triggered when player scores a point
* `hit` - Triggered when player hits a ball

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

* `setSize( number )` - Set ball radius in pixels
* `setColor( string )` - Set ball color using hexa string (`#xxxxxx`)
* `rebound( direction )` - Reset ball position, pointing right when `direction` is positive, left when negative

#### Properties

* `color` - Octal color string
* `size` - Ball radius in pixels
* `velocity` - Object containing X and Y velocity
