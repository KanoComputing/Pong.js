/* global module, require */

'use strict';

var pixi = require('pixi'),
    config = require('./config'),
    ScoreDisplay;

ScoreDisplay = function (player) {
    this.player = player;
    this.render();
};

ScoreDisplay.prototype.render = function () {
    this.text = new pixi.Text(this.player.score + '', {
        font: '60px Bariol',
        fill: 'white'
    });

    if (this.player.side === 'left') {
        this.text.anchor.x = 1;
    } else {
        this.text.anchor.x = 0;
    }

    this.text.position.y = config.SCORES_MARGIN.y;
    this.player.game.stage.addChild(this.text);
};

ScoreDisplay.prototype.updatePosition = function () {
    var renderer = this.player.game.renderer;

    if (this.player.side === 'left') {
        this.text.position.x = renderer.width / 2 - config.SCORES_MARGIN.x;
    } else {
        this.text.position.x = renderer.width / 2 + config.SCORES_MARGIN.x;
    }
};

ScoreDisplay.prototype.resize = function () {
    this.updatePosition();
};

module.exports = ScoreDisplay;
