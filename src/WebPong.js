/* global module, require */

'use strict';

var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    StartScreen = require('./StartScreen'),
    WebPong;

WebPong = function (wrapper) {
    var self = this;

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(0x333333);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
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
};

WebPong.prototype.update = function () {
    this.renderer.render(this.stage);

    for (var player in this.players) {
        if (this.players.hasOwnProperty(player)) {
            this.players[player].update();
        }
    }

    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].update();
    }
};

WebPong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.renderer.resize(width, height);
    this.arena.resize();
    this.startScreen.resize();

    for (var player in this.players) {
        if (this.players.hasOwnProperty(player)) {
            this.players[player].updatePosition();
        }
    }

    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].updatePosition();
    }
};

WebPong.prototype.reset = function () {
    for (var key in this.players) {
        if (this.players.hasOwnProperty(key)) {
            this.players[key].reset();
        }
    }

    for (var i = 0; i < this.balls.length; i += 1) {
        this.balls[i].reset();
    }
};

module.exports = WebPong;
