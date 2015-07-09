
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

    socket.on('game-started', function () {
      self.game.start();
      console.log('the game started');
    })

    socket.on('game-ended', function () {
      self.game.reset();
      console.log('the game ended');
    });

    MessageScreen.prototype.bind.apply(this, arguments);

    this.game.on('start', function () {
      self.hide();
    });

    this.game.on('reset', function () {
      self.show();
    });

    document.addEventListener('keydown', function (e) {
        var key = keycode(e.keyCode);

        if (key === 'enter') {
          if (!self.game.loop.playing) {
              socket.emit('game-start', {started: true})
              self.game.start();
            }
        } else {
          if (key === 'esc') {
            socket.emit('game-start', {started: false})
            self.game.reset();
          }
        }
    });
};

module.exports = StartScreen;
