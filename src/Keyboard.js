
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
    this.controls = {};
    this.addControls(controls);
    this.bind();
};

Keyboard.prototype.addControls = function (controls) {
    var hasControl, key;

    controls = normaliseControls(controls);

    for (key in controls) {
        if (this.controls.hasOwnProperty(key) && this.controls[key]) {
            this.controls[key] = this.controls[key].concat(controls[key]);
        } else {
            this.controls[key] = controls[key];
        }
    }

    for (key in this.controls) {
        hasControl = this.pressed.hasOwnProperty(key);
        if (this.controls.hasOwnProperty(key) && !hasControl) {
            this.pressed[key] = false;
        }
    }
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
