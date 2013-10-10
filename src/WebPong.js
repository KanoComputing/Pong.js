/* global module, require */

'use strict';

var pixi = require('pixi'),
    Loop = require('game-loop'),
    Player = require('./Player'),
    Ball = require('./Ball'),
    config = require('./config'),
    WebPong;

WebPong = function (wrapper) {
    var self = this;

    this.wrapper = wrapper;
    this.stage = new pixi.Stage(0x333333);
    this.renderer = pixi.autoDetectRenderer();
    this.loop = new Loop();

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

    this.ball = new Ball(this);

    this.resize();
    this.drawLines();

    this.loop.use(function () {
        self.update();
    });

    wrapper.appendChild(this.renderer.view);
};

WebPong.prototype.start = function () {
    this.loop.play();
};

WebPong.prototype.update = function () {
    this.renderer.render(this.stage);

    for (var player in this.players) {
        if (this.players.hasOwnProperty(player)) {
            this.players[player].update();
        }
    }

    this.ball.update();
};

WebPong.prototype.resize = function () {
    var width = this.wrapper.clientWidth,
        height = this.wrapper.clientHeight;

    this.renderer.resize(width, height);

    for (var player in this.players) {
        if (this.players.hasOwnProperty(player)) {
            this.players[player].updatePosition();
        }
    }
};

WebPong.prototype.drawLines = function () {
    var positions = [
            config.linesDistance,
            this.renderer.width / 2,
            this.renderer.width - config.linesDistance
        ],
        lines = new pixi.Graphics();

    this.stage.addChild(lines);

    for (var i = 0; i < positions.length; i += 1) {
        lines.beginFill(0xFFFFFF, 1);
        lines.drawRect(positions[i], 0, 1, this.renderer.height);
        lines.endFill();
    }
};

module.exports = WebPong;
