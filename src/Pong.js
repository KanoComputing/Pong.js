
var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    PauseScreen = require('./PauseScreen'),
    EventEmitter = require('event-emitter'),
    config = require('./config'),
    extend = require('deep-extend'),
    parseOctal = require('./utils').parseOctal,
    keycode = require('keycode'),
    ballDefaults = {
        color: config.BALL_COLOR,
        size: config.BALL_SIZE,
        speed: config.BALL_SPEED
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
    this.hits = 0;
    this.ballSettings = extend({}, ballDefaults);
    this.started = false;

    this.players = {
        a: new Player(this, { side: 'left' }),
        b: new Player(this, { side: 'right' })
    };

    this.resize();
    this.bind();
    this.startScreen.show();
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
        self.hits += 1;
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'p') {
            self.togglePause();
        } else if (key === ' esc' || key === 'r') {
            self.reset();
        }
    });
};

Pong.prototype.addBall = function () {
    this.balls.push(new Ball(this, {
        color: this.ballSettings.color,
        size: this.ballSettings.size,
        speed: this.ballSettings.speed
    }));
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
        this.refresh();
        this.emit('update', this);
    }
};

Pong.prototype.refresh = function () {
    this.renderer.render(this.stage);
};

Pong.prototype.updateIfStill = function () {
    if (!this.loop.playing) {
        this.update();
    }
};

Pong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.renderer.resize(width, height);

    this.emit('resize', width, height, this);

    this.renderer.render(this.stage);
};

Pong.prototype.restart = function (addBall) {
    this.hits = 0;
    this.resetBalls();

    if (addBall) {
        this.addBall();
    }

    this.emit('restart', this);
    this.refresh();
};

Pong.prototype.reset = function () {
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
    this.stage.setBackgroundColor(parseOctal(color));
    this.updateIfStill();
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

Pong.prototype.setBallSize = function (size) {
    this.ballSettings.size = size;
    this.emit('setBallSize', size);
};

Pong.prototype.setBallSpeed = function (speed) {
    this.ballSettings.speed = speed;
    this.emit('setBallSpeed', speed);
};

module.exports = Pong;
