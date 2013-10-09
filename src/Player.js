/* global module, require */

'use strict';

var pixi = require('pixi'),
    Controls = require('./Controls'),
    Player,
    defaults = {
        barWidth: 10,
        barHeight: 100
    },
    paddingX = 20;

Player = function (game, options) {
    this.game = game;
    this.side = options.side;
    this.width = options.width || defaults.barWidth;
    this.height = options.height || defaults.barHeight;
    this.y = 0;

    if (options.side !== 'left' && options.side !== 'right') {
        this.side = 'left';
    }

    this.bar = new pixi.Graphics();
    this.game.stage.addChild(this.bar);

    if (options.controls) {
        this.setControls(options.controls);
    }

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
};

Player.prototype.updateX = function () {
    var stageWidth = this.game.renderer.width;

    if (this.side === 'left') {
        this.bar.position.x = paddingX;
    } else {
        this.bar.position.x = stageWidth - paddingX - this.width;
    }
};

Player.prototype.setControls = function (controls) {
    this.controls = new Controls(controls);
};

module.exports = Player;
