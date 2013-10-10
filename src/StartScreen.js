/* global module, require */

'use strict';

var StartScreen,
    pixi = require('pixi'),
    keycode = require('keycode');

StartScreen = function (game) {
    this.game = game;
    this.drawStartMessage();
    this.bind();
};

StartScreen.prototype.bind = function () {
    var self = this;

    document.addEventListener('keydown', function (e) {
        if (keycode(e.keyCode) === 'enter') {
            self.hide();
            self.game.start();
        }
    });
};

StartScreen.prototype.drawStartMessage = function () {
    this.startMsg = new pixi.Text('PRESS ENTER', {
        font: '60px Bariol',
        fill: 'white',
        align: 'center'
    });

    this.hide();
    this.game.stage.addChild(this.startMsg);
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
