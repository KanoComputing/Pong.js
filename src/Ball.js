 
var pixi = require('pixi'),
    geometry = require('geometry'),
    config = require('./config'),
    parseOctal = require('./utils').parseOctal,
    Ball;

Ball = function (game, options) {
    if (!options) {
        options = {};
    }

    this.game =  game;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.size = options.size || config.BALL_SIZE;
    this.setSpeed(options.speed || config.BALL_SPEED);
    this.setVelocity(options.velocity || [config.BALL_SPEED, config.BALL_SPEED]);
    this.lastUpdate = new Date().getTime();
    this.removed = false;
    this.color = parseOctal(options.color) || config.BALL_COLOR;

    this.graphics = new pixi.Graphics();

    if (options.image) {
        this.setImage(options.image);
    }

    this.render();
    this.bind();
};

Ball.prototype.bind = function () {
    var self = this;

    this.game.on('update', function () {
        if (!self.removed) {
            self.update();
        }
    });

    this.game.on('resize', function () {
        if (!self.removed) {
            self.updatePosition();
        }
    });

    this.game.on('setBallColor', function (color) {
        if (!self.removed) {
            self.setColor(color);
        }
    });

    this.game.on('setBallImage', function (image) {
        if (!self.removed) {
            self.setImage(image);
        }
    });

    this.game.on('setBallSize', function (size) {
        if (!self.removed) {
            self.setSize(size);
        }
    });

    this.game.on('setBallSpeed', function (speed) {
        if (!self.removed) {
            self.setSpeed(speed);
        }
    });

    this.game.on('setBallVelocity', function (velocity) {
        if(!self.removed) {
            self.setVelocity(velocity);
        }
    });

    this.game.on('resume', function () {
        if (!self.removed) {
            self.lastUpdate = new Date().getTime();
        }
    });
};

Ball.prototype.render = function () {
    if (this.sprite) {
        this.graphics.removeChild(this.sprite);
    }

    if (this.image) {
        this.sprite = pixi.Sprite.fromImage(this.image);
        this.graphics.addChild(this.sprite);
        this.sprite.width = this.size * 2;
        this.sprite.position.x = - this.size;
        this.sprite.position.y = - this.size;
        this.sprite.height = this.size * 2;
    } else {
        this.graphics = new pixi.Graphics();
        this.graphics.beginFill(this.color, 1);
        this.graphics.drawCircle(0, 0, this.size);
        this.graphics.endFill();
    }

    this.game.stage.addChild(this.graphics);

    this.updatePosition();
};

Ball.prototype.refresh = function () {
    this.render();
};

Ball.prototype.updatePosition = function () {
    var elapsed = new Date().getTime() - this.lastUpdate;

    this.x += (elapsed / 50) * this.velocity.x;
    this.y += (elapsed / 50) * this.velocity.y;

    this.graphics.position.x = this.game.renderer.width / 2 + this.x;
    this.graphics.position.y = this.game.renderer.height / 2 + this.y;
};

Ball.prototype.update = function () {
    if (!this.removed) {
        this.updatePosition();
        this.lastUpdate = new Date().getTime();
        this.checkCollisions();
    }
};

Ball.prototype.getBoundingBox = function () {
    return new geometry.Rect(
        {
            x: this.game.renderer.width / 2 + this.x - this.size,
            y: this.game.renderer.height / 2 + this.y - this.size
        },
        {
            width: this.size * 2,
            height: this.size * 2
        }
    );
};

Ball.prototype.checkCollisions = function () {
    if (this.checkWallsCollision()) {
        return true;
    }

    for (var key in this.game.players) {
        if (this.game.players.hasOwnProperty(key)) {
            if (this.checkPlayerCollision(this.game.players[key])) {
                return true;
            }
        }
    }

    return false;
};

Ball.prototype.checkWallsCollision = function () {
    var BB = this.getBoundingBox();

    if (BB.origin.y < 0) {
        this.bounce(0, 1);
    } else if (BB.getMax().y > this.game.renderer.height) {
        this.bounce(0, -1);
    } else if (BB.origin.x < config.LINES_DISTANCE) {
        this.game.players.b.addPoint();
        this.game.restart(true, 1);
    } else if (BB.origin.x > this.game.renderer.width - config.LINES_DISTANCE) {
        this.game.players.a.addPoint();
        this.game.restart(true, 0);
    } else {
        return false;
    }

    return true;
};

Ball.prototype.checkPlayerCollision = function (player) {
    var BB = this.getBoundingBox(),
        targetBB = player.getBoundingBox();

    if (BB.intersectsRect(targetBB)) {

        player.emit('bounce', [ this ]);
        this.game.emit('hit', this);

        if (player.side === 'left') {
            this.bounce(1, 0);
            // Move ball away from paddle so in the incidence that the ball changes size, 
            // the ball doesn't stay in contact with the paddle
            this.x += this.size;
        } else {
            this.bounce(-1, 0);
            // Move ball away from paddle so in the incidence that the ball changes size, 
            // the ball doesn't stay in contact with the paddle
            this.x -= (this.size / 2 + 1);
        }

        return true;
    }
};

Ball.prototype.remove = function () {
    if (this.sprite) {
        this.graphics.removeChild(this.sprite);
    }

    this.graphics.clear();
    this.removed = true;
};

Ball.prototype.bounce = function (multiplyX, multiplyY) {
    this.game.emit('bounce', this, multiplyX, multiplyY);

    if (multiplyX) {
        this.velocity.x = Math.abs(this.velocity.x) * multiplyX;
    }
    if (multiplyY) {
        this.velocity.y = Math.abs(this.velocity.y) * multiplyY;
    }
};

Ball.prototype.setColor = function (color) {
    this.color = parseOctal(color);
    this.refresh();
};

Ball.prototype.setImage = function (image) {
    this.image = image;
    this.refresh();
};

Ball.prototype.setSize = function (size) {
    this.size = size;
    this.refresh();
};

Ball.prototype.setVelocity = function (velocity) {
    this.velocity = {
        x: velocity[0],
        y: velocity[1]
    };
};

Ball.prototype.setSpeed = function (speed) {
    this.speed = speed;

    this.velocity = {
        x: speed,
        y: speed
    };
};

Ball.prototype.rebound = function (dir) {
    this.x = 0;
    this.velocity.x = -this.velocity.x * (dir ? 1 : -1);
};

module.exports = Ball;
