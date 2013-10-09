/* global module, require */

'use strict';

var pixi = require('pixi'),
    Ball,
    defaults = {
        speed: 300,
        angle: Math.random() * 360,
        size: 10
    };

Ball = function (game, options) {
    if (!options) {
        options = {};
    }

    this.game =  game;
    this.x = 0;
    this.y = 0;
    this.angle = options.angle || defaults.angle;
    this.size = options.size || defaults.size;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();

    this.render();
};

Ball.prototype.render = function () {
    this.graphics = new pixi.Graphics();
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawCircle(0, 0, this.size);
    this.graphics.endFill();

    this.game.stage.addChild(this.graphics);

    this.updatePosition();
};

Ball.prototype.updatePosition = function () {
    var elapsed = new Date().getTime() - this.lastUpdate,
        distance = (elapsed / 1000) * this.speed;

    this.x += Math.cos(this.angle * (Math.PI / 180)) * distance;
    this.y += Math.sin(this.angle * (Math.PI / 180)) * distance;

    this.graphics.position.x = this.game.renderer.width / 2 + this.x;
    this.graphics.position.y = this.game.renderer.height / 2 + this.y;
};

Ball.prototype.update = function () {
    this.updatePosition();
    this.lastUpdate = new Date().getTime();
};

module.exports = Ball;
