/* global module, require */

'use strict';

var pixi = require('pixi'),
    Keyboard = require('./Keyboard'),
    Player,
    defaults = {
        barWidth: 10,
        barHeight: 100,
        controls: {
            'up': null,
            'down': null
        },
        speed: 300
    },
    paddingX = 20;

Player = function (game, options) {
    this.game = game;
    this.side = options.side;
    this.width = options.width || defaults.barWidth;
    this.height = options.height || defaults.barHeight;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();
    this.keyboard = new Keyboard(options.controls || defaults.controls);
    this.y = 0;

    if (options.side !== 'left' && options.side !== 'right') {
        this.side = 'left';
    }

    this.bar = new pixi.Graphics();
    this.game.stage.addChild(this.bar);

    this.render();
    this.updateX();
};

Player.prototype.render = function () {
    this.bar.beginFill(0xFFFFFF, 1);
    this.bar.drawRect(0, 0, this.width, this.height);
    this.bar.endFill();
};

Player.prototype.update = function () {
    var centerY = this.game.renderer.height / 2;

    this.bar.position.y = centerY - this.height / 2 + this.y;

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

Player.prototype.updateX = function () {
    var stageWidth = this.game.renderer.width;

    if (this.side === 'left') {
        this.bar.position.x = paddingX;
    } else {
        this.bar.position.x = stageWidth - paddingX - this.width;
    }
};

module.exports = Player;
