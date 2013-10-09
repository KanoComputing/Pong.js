/* global require, module */

'use strict';

var requestAnimFrame = require('./utils/requestAnimFrame');
  
var Loop;

Loop = function () {
    this.callbacks = [];
    this.playing = false;
    this.fps = 0;
};

Loop.prototype.play = function () {
    var self = this;

    this.playing = true;

    requestAnimFrame(function () {
        self.next();
    });
};

Loop.prototype.stop = function () {
    this.playing = false;
};

Loop.prototype.use = function (callback) {
    this.callbacks.push(callback);
};

Loop.prototype.next = function () {
    var self = this;

    this.getFPS();

    for (var i = 0; i < this.callbacks.length; i += 1) {
        this.callbacks[i]();
    }

    if (this.playing) {
        requestAnimFrame(function () {
            self.next();
        });
    }
};

Loop.prototype.getFPS = function () {
    var delta;

    if (!this.lastUpdate) {
        this.lastUpdate = new Date().getTime();
    }

    delta = (new Date().getTime() - this.lastUpdate) / 1000;
    this.lastUpdate = new Date().getTime();
    this.fps = 1 / delta;
};

module.exports = Loop;
