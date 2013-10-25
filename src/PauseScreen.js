
var MessageScreen = require('./MessageScreen'),
    PauseScreen,

PauseScreen = function () {
    this.message = 'PAUSED';
    MessageScreen.apply(this, arguments);
};

PauseScreen.prototype = Object.create(MessageScreen.prototype);

PauseScreen.prototype.bind = function () {
    var self = this;

    MessageScreen.prototype.bind.apply(this, arguments);

    this.game.on('pause', function () {
        self.show();
    });

    this.game.on('resume', function () {
        self.hide();
    });

    this.game.on('reset', function () {
        self.hide();
    });
};

module.exports = PauseScreen;
