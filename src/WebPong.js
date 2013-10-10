/* global module, require */

'use strict';

var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    Arena = require('./Arena'),
    WebPong;

WebPong = function (wrapper) {
    var self = this;

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(0x333333);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();
    this.balls = [];
    this.arena = new Arena(this);

    this.players = {
        a: new Player(this, {
            side: 'left',
            controls: { up: 'up', down: 'down' }
        }),
        b: new Player(this, {
            side: 'right',
            controls: { up: 'w', down: 's' }
        })
    };

    this.resize();

    this.loop.use(function () {
        self.update();
    });

    this.initScreen();

    wrapper.appendChild(this.renderer.view);
};

WebPong.prototype.initScreen = function () {
    this.update();
};

WebPong.prototype.addBall = function () {
    console.log('fds');
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
