/* global module, require */

'use strict';

var keycode = require('keycode'),
    Keyboard;

function normaliseControls (controls) {
    var out = {},
        val;

    for (var key in controls) {
        val = controls[key];

        if (typeof val === 'object') {
            out[key] = val;
        } else {
            out[key] = [ val ];
        }
    }

    return out;
}

Keyboard = function (controls) {
    this.pressed = {};
    this.controls = normaliseControls(controls);

    for (var key in this.controls) {
        if (this.controls.hasOwnProperty(key)) {
            this.pressed[key] = false;
        }
    }

    this.bind();
};

Keyboard.prototype.bind = function () {
    var self = this;

    document.addEventListener('keydown', function (e) {
        self.setKeyState(keycode(e.keyCode), true);
    }, false);

    document.addEventListener('keyup', function (e) {
        self.setKeyState(keycode(e.keyCode), false);
    }, false);

};

Keyboard.prototype.setKeyState = function (keyName, state) {
    var found, i;

    for (var key in this.controls) {
        if (this.controls.hasOwnProperty(key) && this.controls[key]) {
            found = false;

            for (i = 0; i < this.controls[key].length; i += 1) {
                if (this.controls[key][i] === keyName) {
                    found = true;
                }
            }

            if (found) {
                this.pressed[key] = state;
            }
        }
    }
};

module.exports = Keyboard;
