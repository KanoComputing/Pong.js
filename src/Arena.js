/* global module, require */

'use strict';

var config = require('./config'),
    pixi = require('pixi'),
    Arena;

Arena = function (game) {
    this.game = game;

    this.drawLines();
    this.bind();
};

Arena.prototype.bind = function () {
    var self = this;

    this.game.events.on('resize', function () {
        self.resize();
    });
};

Arena.prototype.getLinePositions = function () {
    return [
        config.linesDistance,
        this.game.renderer.width / 2,
        this.game.renderer.width - config.linesDistance
    ];
};

Arena.prototype.drawLines = function () {
    var positions = this.getLinePositions();

    this.lines = [];

    for (var i = 0; i < positions.length; i += 1) {
        this.lines[i] = new pixi.Graphics();
        this.game.stage.addChild(this.lines[i]);
    }
};

Arena.prototype.updateLines = function () {
    var positions = this.getLinePositions();

    for (var i = 0; i < positions.length; i += 1) {
        this.lines[i].clear();
        this.lines[i].beginFill(0xFFFFFF, 1);
        this.lines[i].drawRect(0, 0, 1, this.game.renderer.height);
        this.lines[i].endFill();
        this.lines[i].position.x = positions[i];
    }
};

Arena.prototype.resize = function () {
    this.updateLines();
};

module.exports = Arena;
