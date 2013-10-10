/* global module, require */

'use strict';

var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    EventEmitter = require('event-emitter'),
    WebPong;

WebPong = function (wrapper) {
    var self = this;

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(0x333333);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.events = new EventEmitter();
    this.arena = new Arena(this);
    this.startScreen = new StartScreen(this);

    this.players = {
        a: new Player(this, {
            side: 'left',
            controls: { up: 'w', down: 's' }
        }),
        b: new Player(this, {
            side: 'right',
            controls: { up: 'up', down: 'down' }
        })
    };

    this.resize();

    this.loop.use(function () {
        self.update();
    });

    this.startScreen.show();
    this.update();

    wrapper.appendChild(this.renderer.view);
};

WebPong.prototype.addBall = function () {
    this.balls.push(new Ball(this));
};

WebPong.prototype.start = function () {
    this.addBall();
    this.loop.play();
    this.events.emit('start', [ this ]);
};

WebPong.prototype.stop = function () {
    this.loop.stop();
    this.events.emit('start', [ this ]);
};

WebPong.prototype.update = function () {
    this.renderer.render(this.stage);

    this.events.emit('update', [ this ]);
};

WebPong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.renderer.resize(width, height);

    this.events.emit('resize', [ width, height, this ]);

    this.renderer.render(this.stage);
};

WebPong.prototype.reset = function () {
    this.events.emit('reset', [ this ]);
};

module.exports = WebPong;
