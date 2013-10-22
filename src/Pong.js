
var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    EventEmitter = require('event-emitter'),
    config = require('./config'),
    extend = require('deep-extend'),
    parseOctal = require('./utils').parseOctal,
    ballDefaults = {
        color: config.BALL_COLOR,
        size: config.BALL_SIZE,
        speed: config.BALL_SPEED
    },
    Pong;

Pong = function (wrapper) {
    EventEmitter.call(this);

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(config.BG_COLOR);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);
    this.hits = 0;
    this.ballSettings = extend({}, ballDefaults);

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
    this.emit('start', this);
};

Pong.prototype.stop = function () {
    this.loop.stop();
    this.emit('stop', this);
};

Pong.prototype.update = function () {
    this.renderer.render(this.stage);

    this.emit('update', this);
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

Pong.prototype.reset = function () {
    this.emit('reset', this);
    this.hits = 0;
    this.resetBalls();
};

Pong.prototype.resetBalls = function () {
    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].remove();
    }

    this.balls = [];
    this.addBall();
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
