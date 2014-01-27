
var pixi = require('pixi'),
    config = require('./config'),
    Keyboard = require('./Keyboard'),
    ScoreDisplay = require('./ScoreDisplay'),
    geometry = require('geometry'),
    EventEmitter = require('event-emitter'),
    parseOctal = require('./utils').parseOctal,
    defaults = {
        barHeight: 100,
        controls: {
            'up': null,
            'down': null
        },
        speed: 300
    },
    Player;

Player = function (game, options) {
    EventEmitter.apply(this);

    this.game = game;
    this.side = options.side;
    this.width = config.BARS_WIDTH;
    this.height = options.height || defaults.barHeight;
    this.speed = options.speed || defaults.speed;
    this.lastUpdate = new Date().getTime();
    this.keyboard = new Keyboard(options.controls || defaults.controls);
    this.y = 0;
    this.score = 0;
    this.scoreDisplay = new ScoreDisplay(this);
    this.color = config.PLAYER_COLOR;

    if (options.side !== 'left' && options.side !== 'right') {
        this.side = 'left';
    }

    this.graphics = new pixi.Graphics();
    this.game.stage.addChild(this.graphics);

    this.render();
    this.bind();
    this.updatePosition();
};

Player.prototype = new EventEmitter();

Player.prototype.addControls = function (controls) {
    this.keyboard.addControls(controls);
};

Player.prototype.bind = function () {
    var self = this;

    this.game.on('update', function () {
        self.update();
    });

    this.game.on('resize', function () {
        self.resize();
    });

    this.game.on('reset', function () {
        self.reset();
    });

    this.game.on('restart', function () {
        self.restart();
    });
};

Player.prototype.render = function () {
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(0, 0, this.width, this.height);
    this.graphics.endFill();
};

Player.prototype.update = function () {
    this.graphics.position.y = this.screenY();

    if (this.keyboard.pressed.up) {
        this.move(-1);
    }

    if (this.keyboard.pressed.down) {
        this.move(1);
    }

    this.lastUpdate = new Date().getTime();
};

Player.prototype.move = function (direction) {
    var elapsed = new Date().getTime() - this.lastUpdate || 1000 / 60,
        distance = (elapsed / 1000) * this.speed,
        stageHeight = this.game.renderer.height,
        newY;

    newY = this.y + distance * direction;

    if (newY > stageHeight / 2 - this.height / 2) {
        newY = stageHeight / 2 - this.height / 2;
    } else if (newY < -stageHeight / 2 + this.height / 2) {
        newY = -stageHeight / 2 + this.height / 2;
    }

    this.y = newY;
    this.lastFrameLength = elapsed;
};

Player.prototype.screenX = function () {
    var stageWidth = this.game.renderer.width,
        spacing = config.LINES_DISTANCE + config.PLAYER_MARGIN;

    if (this.side === 'left') {
        return spacing;
    } else {
        return stageWidth - spacing - this.width;
    }
};

Player.prototype.screenY = function () {
    return this.y + this.game.renderer.height / 2 - this.height / 2;
};

Player.prototype.updatePosition = function () {
    this.graphics.position.x = this.screenX();
    this.graphics.position.y = this.screenY();
    this.scoreDisplay.updatePosition();
};

Player.prototype.resize = function () {
    this.updatePosition();
    this.scoreDisplay.resize();
};

Player.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        { x: this.screenX(), y: this.screenY() },
        { width: this.width, height: this.height }
    );
};

Player.prototype.restart = function () {
    this.y = 0;
    this.update();
};

Player.prototype.reset = function () {
    this.score = 0;
    this.restart();
    this.scoreDisplay.update();
};

Player.prototype.addPoint = function () {
    this.score += 1;
    this.emit('point', this.score);
    this.game.emit('point', this);
};

Player.prototype.refresh = function () {
    this.graphics.clear();
    this.render();
};

Player.prototype.setHeight = function (height) {
    this.height = height;
    this.refresh();
};

Player.prototype.setColor = function (color) {
    this.color = parseOctal(color);
    this.refresh();
    this.game.updateIfStill();
};

Player.prototype.setSpeed = function (speed) {
    this.speed = speed;
};

Player.prototype.setY = function (y) {
    this.y = y;
};

module.exports = Player;
