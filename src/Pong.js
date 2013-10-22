
var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    EventEmitter = require('event-emitter'),
    config = require('./config'),
    Pong;

Pong = function (wrapper) {
    var self = this;

    EventEmitter.call(this);

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(config.BG_COLOR);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);

    this.players = {
        a: new Player(this, { side: 'left' }),
        b: new Player(this, { side: 'right' })
    };

    this.resize();

    this.loop.use(function () {
        self.update();
    });

    this.startScreen.show();
    this.update();

    wrapper.appendChild(this.renderer.view);
};

Pong.prototype = new EventEmitter();

Pong.prototype.addBall = function () {
    this.balls.push(new Ball(this));
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
    this.stage.setBackgroundColor('0x' + color.substr(1));
    this.updateIfStill();
};

Pong.prototype.setLinesColor = function (color) {
    this.emit('setLinesColor', color);
    this.updateIfStill();
};

Pong.prototype.setBallColor = function (color) {
    this.emit('setBallColor', color);
};

Pong.prototype.setTextStyle = function (style) {
    this.emit('setTextStyle', style);
    this.updateIfStill();
};

module.exports = Pong;
