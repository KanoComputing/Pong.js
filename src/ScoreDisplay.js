
var pixi = require('pixi'),
    config = require('./config'),
    extend = require('deep-extend'),
    ScoreDisplay;

ScoreDisplay = function (player) {
    this.player = player;
    this.render();
    this.bind();
};

ScoreDisplay.prototype.bind = function () {
    var self = this;

    this.player.on('point', function () {
        self.update();
    });

    this.player.game.on('setTextStyle', function (color) {
        self.setTextStyle(color);
    });
};

ScoreDisplay.prototype.setTextStyle = function (style) {
    style = extend(config.TEXT_STYLE, style);
    this.text.setStyle(style);
};

ScoreDisplay.prototype.render = function () {
    this.text = new pixi.Text(this.player.score + '', config.TEXT_STYLE);

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

ScoreDisplay.prototype.update = function () {
    this.text.setText(this.player.score + '');
};

ScoreDisplay.prototype.resize = function () {
    this.updatePosition();
};

module.exports = ScoreDisplay;
