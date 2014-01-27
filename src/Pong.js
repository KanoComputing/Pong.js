
var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    PauseScreen = require('./PauseScreen'),
    MessageScreen = require('./MessageScreen'),
    EventEmitter = require('event-emitter'),
    parseOctal = require('./utils').parseOctal,
    config = require('./config'),
    extend = require('deep-extend'),
    keycode = require('keycode'),
    ballDefaults = {
        color: config.BALL_COLOR,
        image: null,
        size: config.BALL_SIZE,
        speed: config.BALL_SPEED,
        velocity: [ config.BALL_SPEED, config.BALL_SPEED ]
    },
    Pong;

Pong = function (wrapper) {
    EventEmitter.apply(this);

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(config.BG_COLOR);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);
    this.pauseScreen = new PauseScreen(this);
    this.endScreen = new MessageScreen(this);
    this.hits = 0;
    this.totalHits = 0;
    this.bounces = 0;
    this.totalBounces = 0;
    this.ballSettings = extend({}, ballDefaults);
    this.started = false;

    this.players = {
        a: new Player(this, { side: 'left' }),
        b: new Player(this, { side: 'right' })
    };

    this.resize();
    this.bind();
    this.startScreen.show();
    this.endScreen.hide();
    this.update();

    wrapper.appendChild(this.renderer.view);
};

Pong.prototype = new EventEmitter();

Pong.prototype.bind = function () {
    var self = this;

    this.loop.use(function () {
        self.update();
    });

    this.on('bounce', function () {
        self.bounces += 1;
        self.totalBounces += 1;
    });

    this.on('hit', function () {
        self.hits += 1;
        self.totalHits += 1;
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'p') {
            self.togglePause();
        } else if (key === 'esc' || key === 'r') {
            self.reset();
            self.endScreen.hide();
        } else if (key === 'enter' && self.won) {
            self.reset();
            self.won = false;
            self.loop.play();
            self.endScreen.hide();
            self.start();
        }
    });
};

Pong.prototype.addBall = function () {
    var ball = new Ball(this, {
        color: this.ballSettings.color,
        image: this.ballSettings.image,
        size: this.ballSettings.size,
        speed: this.ballSettings.speed,
        velocity: this.ballSettings.velocity
    });

    this.balls.push(ball);
    return ball;
};

Pong.prototype.start = function () {
    this.addBall();
    this.loop.play();
    this.started = true;
    this.emit('start', this);
};

Pong.prototype.pause = function () {
    if (this.started) {
        this.emit('pause', this);
        this.loop.stop();
    }
};

Pong.prototype.resume = function () {
    if (this.started) {
        this.emit('resume', this);
        this.loop.play();
    }
};

Pong.prototype.togglePause = function () {
    if (!this.loop.playing) {
        this.resume();
    } else {
        this.pause();
    }
};

Pong.prototype.update = function () {
    if (this.started) {
        this.emit('beforeupdate', this);
        this.refresh();
        this.emit('update', this);
    }
};

Pong.prototype.refresh = function () {
    this.renderer.render(this.stage);
};

Pong.prototype.updateIfStill = function () {
    if (!this.loop.playing) {
        this.refresh();
    }
};

Pong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.updateBackgroundSize();
    this.renderer.resize(width, height);
    this.emit('resize', width, height, this);
    this.renderer.render(this.stage);
};

Pong.prototype.updateBackgroundSize = function () {
    if (this.backgroundImage) {
        this.backgroundImage.width = this.renderer.width;
        this.backgroundImage.height = this.renderer.height;
    }
};

Pong.prototype.restart = function (addBall, dir) {
    var ball;

    this.hits = 0;
    this.bounces = 0;

    this.resetBalls();

    if (addBall) {
        ball = this.addBall();
        ball.rebound(dir || 0);
    }

    this.emit('restart', this);
    this.refresh();
};

Pong.prototype.reset = function () {
    this.totalHits = 0;
    this.totalBounces = 0;
    this.restart(false);
    this.pause();
    this.emit('reset', this);
    this.started = false;
    this.refresh();
};

Pong.prototype.resetBalls = function () {
    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].remove();
    }

    this.balls = [];
};

Pong.prototype.setBackgroundColor = function (color) {
    if (this.renderer instanceof pixi.CanvasRenderer) {
        color = color.split('#')[1];
    } else {
        color = parseOctal(color);
    }

    this.stage.setBackgroundColor(color);
    this.updateIfStill();
};

Pong.prototype.setBackgroundImage = function (image) {
    if (this.backgroundImage) {
        this.stage.removeChild(this.backgroundImage);
    }

    this.backgroundImage = pixi.Sprite.fromImage(image);
    this.updateBackgroundSize();
    this.stage.addChildAt(this.backgroundImage, 0);
    var self = this;

    var preload = new Image();
    preload.src = image;

    this.backgroundImage.texture.baseTexture.on('loaded', function () {
        self.refresh();
    });
};

Pong.prototype.setLinesColor = function (color) {
    this.emit('setLinesColor', color);
    this.updateIfStill();
};

Pong.prototype.setTextStyle = function (style) {
    this.emit('setTextStyle', style);
    this.updateIfStill();
};

Pong.prototype.setBallColor = function (color) {
    this.ballSettings.color = color;
    this.emit('setBallColor', color);
};

Pong.prototype.setBallImage = function (image) {
    this.ballSettings.image = image;
    this.emit('setBallImage', image);
};

Pong.prototype.setBallSize = function (size) {
    this.ballSettings.size = size;
    this.emit('setBallSize', size);
};

Pong.prototype.setBallSpeed = function (speed) {
    this.ballSettings.speed = speed;
    this.emit('setBallSpeed', speed);
};

Pong.prototype.setBallVelocity = function (velocity) {
    this.ballSettings.velocity = velocity;
    this.emit('setBallVelocity', velocity);
};

Pong.prototype.win = function (message) {
    this.loop.stop();
    this.endScreen.setMessage(message);
    this.endScreen.show();
    this.won = true;
};

module.exports = Pong;
