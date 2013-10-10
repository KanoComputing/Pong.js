/* global module, require */

'use strict';

var pixi = require('pixi'),
    geometry = require('geometry'),
    config = require('./config'),
    defaults = {
        speed: 300,
        angle: 15,
        size: 10
    },
    Ball;

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

    this.velocity = {
        x: this.speed,
        y: this.speed
    };

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
    var elapsed = new Date().getTime() - this.lastUpdate;

    this.x += (elapsed / 1000) * this.velocity.x;
    this.y += (elapsed / 1000) * this.velocity.y;

    this.graphics.position.x = this.game.renderer.width / 2 + this.x;
    this.graphics.position.y = this.game.renderer.height / 2 + this.y;
};

Ball.prototype.update = function () {
    this.updatePosition();
    this.lastUpdate = new Date().getTime();
    this.checkCollisions();
};

Ball.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        {
            x: this.game.renderer.width / 2 + this.x - this.size,
            y: this.game.renderer.height / 2 + this.y - this.size
        },
        {
            width: this.size * 2,
            height: this.size * 2
        }
    );
};

Ball.prototype.checkCollisions = function () {
    if (this.checkWallsCollision()) {
        return true;
    }

    for (var key in this.game.players) {
        if (this.game.players.hasOwnProperty(key)) {
            if (this.checkPlayerCollision(this.game.players[key])) {
                return true;
            }
        }
    }

    return false;
};

Ball.prototype.checkWallsCollision = function () {
    var BB = this.getBoundingBox();

    if (BB.origin.y < 0) {
        this.bounce(0, 1);
    } else if (BB.getMax().y > this.game.renderer.height) {
        this.bounce(0, -1);
    } else if (BB.origin.x < config.linesDistance) {
        this.game.players.b.addPoint();
        this.game.reset();
    } else if (BB.origin.x > this.game.renderer.width - config.linesDistance) {
        this.game.players.a.addPoint();
        this.game.reset();
    } else {
        return false;
    }

    return true;
};

Ball.prototype.checkPlayerCollision = function (player) {
    var BB = this.getBoundingBox(),
        targetBB = player.getBoundingBox();

    if (BB.intersectsRect(targetBB)) {

        if (player.side === 'left') {
            this.bounce(1, 0);
        } else {
            this.bounce(-1, 0);
        }

        return true;
    }
};

Ball.prototype.bounce = function (multiplyX, multiplyY) {
    if (multiplyX) {
        this.velocity.x = Math.abs(this.velocity.x) * multiplyX;
    }
    if (multiplyY) {
        this.velocity.y = Math.abs(this.velocity.y) * multiplyY;
    }
};

Ball.prototype.reset = function () {
    this.x = 0;
    this.y = 0;
};

module.exports = Ball;
