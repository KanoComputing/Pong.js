
var pixi = require('pixi'),
    config = require('./config'),
    parseOctal = require('./utils').parseOctal,
    Arena;

Arena = function (game) {
    this.game = game;
    this.linesColor = config.LINES_COLOR;

    this.drawLines();
    this.bind();
};

Arena.prototype.bind = function () {
    var self = this;

    this.game.on('resize', function () {
        self.resize();
    });

    this.game.on('setLinesColor', function (color) {
        self.setLinesColor(color);
    });
};

Arena.prototype.setLinesColor = function (color) {
    this.linesColor = parseOctal(color);
    this.updateLines();
};

Arena.prototype.getLinePositions = function () {
    return [
        config.LINES_DISTANCE,
        this.game.renderer.width / 2,
        this.game.renderer.width - config.LINES_DISTANCE
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
        this.lines[i].beginFill(this.linesColor, 1);
        this.lines[i].drawRect(0, 0, 1, this.game.renderer.height);
        this.lines[i].endFill();
        this.lines[i].position.x = positions[i];
    }
};

Arena.prototype.resize = function () {
    this.updateLines();
};

module.exports = Arena;
