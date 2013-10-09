/* global module, require */

'use strict';

var keycode = require('keycode'),
    Controls;

Controls = function (keys) {
    this.pressed = {};
    this.keys = keys;

    for (var key in this.keys) {
        if (this.keys.hasOwnProperty(key)) {
            this.pressed[key] = false;
        }
    }

    this.bind();
};

Controls.prototype.bind = function () {

    document.addEventListener('keydown', function (e) {
        this.setKeyState(keycode(e.keyCode), true);
    }, false);

    document.addEventListener('keydown', function (e) {
        this.setKeyState(keycode(e.keyCode), false);
    }, false);

};

Controls.setKeyState = function (keycode, state) {
    for (var key in this.keys) {
        if (keycode(keycode) === key) {
            this.pressed[key] = state;
        }
    }
};

module.exports = Controls;
