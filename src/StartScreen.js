/* global module, require */

'use strict';

var StartScreen,
    pixi = require('pixi'),
    keycode = require('keycode'),
    config = require('./config'),
    extend = require('deep-extend');

StartScreen = function (game) {
    this.game = game;
    this.drawStartMessage();
    this.bind();
};

StartScreen.prototype.bind = function () {
    var self = this;

    this.game.events.on('start', function () {
        self.hide();
    });

    this.game.events.on('stop', function () {
        self.show();
    });

    this.game.events.on('resize', function () {
        self.resize();
    });

    this.game.events.on('setTextStyle', function (color) {
        self.setTextStyle(color);
    });

    document.addEventListener('keydown', function (e) {
        if (keycode(e.keyCode) === 'enter') {
            if (!self.game.loop.playing) {
                self.game.start();
            }
        }
    });
};

StartScreen.prototype.drawStartMessage = function () {
    this.startMsg = new pixi.Text('PRESS ENTER', config.TEXT_STYLE);

    this.hide();
    this.game.stage.addChild(this.startMsg);
};

StartScreen.prototype.setTextStyle = function (style) {
    style = extend(config.TEXT_STYLE, style);
    this.startMsg.setStyle(style);
};

StartScreen.prototype.resize = function () {
    this.startMsg.position = {
        x: this.game.renderer.width / 2,
        y: this.game.renderer.height / 2
    };
    this.startMsg.anchor = { x: 0.5, y: 0.5 };
};

StartScreen.prototype.hide = function () {
    this.visible = false;
    this.startMsg.visible = false;
};

StartScreen.prototype.show = function () {
    this.visible = true;
    this.startMsg.visible = true;
};

module.exports = StartScreen;
