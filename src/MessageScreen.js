
var config = require('./config'),
    extend = require('deep-extend'),
    pixi = require('pixi'),
    MessageScreen;

MessageScreen = function (game) {
    this.message = this.message || '';
    this.game = game;
    this.drawMessage();
    this.bind();
};

MessageScreen.prototype.bind = function () {
    var self = this;

    this.game.on('setTextStyle', function (color) {
        self.setTextStyle(color);
    });

    this.game.on('resize', function () {
        self.resize();
    });
};

MessageScreen.prototype.drawMessage = function () {
    this.startMsg = new pixi.Text(this.message, config.TEXT_STYLE);

    this.hide();
    this.game.stage.addChild(this.startMsg);
};

MessageScreen.prototype.setMessage = function (message) {
    this.startMsg.setText(message);
};

MessageScreen.prototype.setTextStyle = function (style) {
    style = extend(config.TEXT_STYLE, style);
    this.startMsg.setStyle(style);
};

MessageScreen.prototype.resize = function () {
    this.startMsg.position = {
        x: this.game.renderer.width / 2,
        y: this.game.renderer.height / 2
    };
    this.startMsg.anchor = { x: 0.5, y: 0.5 };
};

MessageScreen.prototype.hide = function () {
    this.visible = false;
    this.startMsg.visible = false;
    this.game.refresh();
};

MessageScreen.prototype.show = function () {
    this.visible = true;
    this.startMsg.visible = true;
    this.game.refresh();
};


module.exports = MessageScreen;
