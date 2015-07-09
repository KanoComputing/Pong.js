
var keycode = require('keycode'),
    MessageScreen = require('./MessageScreen'),
    StartScreen,


StartScreen = function () {
    this.message = 'PRESS ENTER';
    MessageScreen.apply(this, arguments);
};
var io = window.io;
var socket = io('http://localhost:3000');
StartScreen.prototype = Object.create(MessageScreen.prototype);

StartScreen.prototype.bind = function () {
    var self = this;
    // var socket = window.socket

    MessageScreen.prototype.bind.apply(this, arguments);

    this.game.on('start', function () {
      socket.emit('game-start', {started: true})
      socket.on('game-started', function () {
        console.log('the game started');
        self.hide();
      })
    });

    this.game.on('reset', function () {
      socket.emit('game-start', {started: false})
      socket.on('game-ended', function () {
        console.log('the game ended');
        self.show();
      });
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'enter') {

            if (!self.game.loop.playing) {
                self.game.start();
            }
        }
    });
};

module.exports = StartScreen;
