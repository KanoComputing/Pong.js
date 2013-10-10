/* global module, require */

'use strict';

var pixi = require('pixi'),
    config = require('./config'),
    Keyboard = require('./Keyboard'),
    geometry = require('geometry'),
    defaults = {
        barWidth: config.barsWidth,
        barHeight: 100,
        controls: {
            'up': null,
            'down': null
        },
        speed: 300
    },
    Player;

Player = function (game, options) {
    this.game = game;
    this.side = options.side;
    this.width = options.width || defaults.barWidth;
    this.height = options.height || defaults.barHeight;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();
    this.keyboard = new Keyboard(options.controls || defaults.controls);
    this.y = 0;
    this.score = 0;

    if (options.side !== 'left' && options.side !== 'right') {
        this.side = 'left';
    }

    this.graphics = new pixi.Graphics();
    this.game.stage.addChild(this.graphics);

    this.render();
    this.updatePosition();
};

Player.prototype.render = function () {
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawRect(0, 0, this.width, this.height);
    this.graphics.endFill();
};

Player.prototype.update = function () {
    var centerY = this.game.renderer.height / 2;

    this.graphics.position.y = centerY - this.height / 2 + this.y;

    if (this.keyboard.pressed.up) {
        this.move(-1);
    }

    if (this.keyboard.pressed.down) {
        this.move(1);
    }

    this.lastUpdate = new Date().getTime();
};

Player.prototype.move = function (direction) {
    var elapsed = new Date().getTime() - this.lastUpdate,
        distance = (elapsed / 1000) * this.speed,
        stageHeight = this.game.renderer.height,
        newY;

    newY = this.y + distance * direction;

    if (newY > stageHeight / 2 - this.height / 2) {
        newY = stageHeight / 2 - this.height / 2;
    } else if (newY < -stageHeight / 2 + this.height / 2) {
        newY = -stageHeight / 2 + this.height / 2;
    }

    this.y = newY;
};

Player.prototype.updatePosition = function () {
    this.graphics.position.x = this.getX();
};

Player.prototype.getX = function () {
    var stageWidth = this.game.renderer.width,
        spacing = config.linesDistance + config.playerMargin;

    if (this.side === 'left') {
        return spacing;
    } else {
        return stageWidth - spacing - this.width;
    }
};

Player.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        {
            x: this.getX(),
            y: this.y + this.game.renderer.height / 2 - this.height / 2
        },
        {
            width: this.width,
            height: this.height
        }
    );
};

Player.prototype.reset = function () {
    this.y = 0;
};

Player.prototype.addPoint = function () {
    this.score += 1;
};

module.exports = Player;
