var GameObject = require('./GameObject'),
    Input = require('./Input'),
    Color = require('./Color'),
    vec2 = require('gl-matrix').vec2,
    SpriteManager = require('./SpriteManager');

// XXX orig values: friction = 0.9, accel = 0.3
var SHIP_FRICTION = 0.8;
var SHIP_ACCEL = 0.5;
var SHIP_EPS = 0.0001;
var BOUNCE_FRICTION = 0.4;

var kamehaOffset = vec2.fromValues(17, 2);
var beamOffset = vec2.add(vec2.create(), kamehaOffset, vec2.fromValues(10, 3));
var beamHeight = 4;
var fireDuration = 500.0;
var fireCooldown = 1500.0;
var shipWidth = 18;
var shipHeight = 10;

var Beam = GameObject.extend({
  updateBoundingBox: function(x, y, width, height) {
    this._boundingBox = {x: x, y: y, width: width, height: height};
  },

  getBoundingBox: function() {
    return this._boundingBox;
  },

  getType: function() { return 'beam'; }
});

var Player = GameObject.extend({
  constructor: function() {
    this.base();
    this._pos = vec2.create();
    this._vel = vec2.create();
    this._firing = false;

    this._lastFire = undefined;
    this._fireStart = undefined;

    this._moveMap = {};
    this._moveMap[Input.K_UP] =  vec2.fromValues(0, -1);
    this._moveMap[Input.K_DOWN] = vec2.fromValues(0, 1);
    this._moveMap[Input.K_LEFT] = vec2.fromValues(-1, 0);
    this._moveMap[Input.K_RIGHT] = vec2.fromValues(1, 0);

    this._beam = null;
  },

  draw: function(ctx) {
    var spriteName;
    if (this._movingUp) {
      spriteName = 'ship_up';
    } else if (this._movingDown) {
      spriteName = 'ship_down';
    } else {
      spriteName = 'ship';
    }

    if (this._firing) {
      var kamehaPos = vec2.add(vec2.create(), this._pos, kamehaOffset);
      SpriteManager.draw(ctx, 'kameha', kamehaPos[0], kamehaPos[1]);
    }

    SpriteManager.draw(ctx, spriteName, this._pos[0], this._pos[1]);

    if (this._firing) {
      Utils.fillRect(
        ctx,
        Color.C_BEAM_OUTER,
        this._pos[0] + beamOffset[0],
        this._pos[1] + beamOffset[1],
        64 - this._pos[0] - beamOffset[0],
        beamHeight
      );
      Utils.fillRect(
        ctx,
        Color.C_BEAM_INNER,
        this._pos[0] + beamOffset[0],
        this._pos[1] + beamOffset[1] + 1,
        64 - this._pos[0] - beamOffset[0],
        beamHeight - 2
      );
    }
  },

  tick: function() {
    for (var k in this._moveMap) {
      if (this._moveMap.hasOwnProperty(k)) {
        if (Input.isKeyDown(k)) {
          vec2.scaleAndAdd(this._vel, this._vel, this._moveMap[k], SHIP_ACCEL);
        }
      }
    }
    this._movingUp = Input.isKeyDown(Input.K_UP);
    this._movingDown = Input.isKeyDown(Input.K_DOWN);
    vec2.scale(this._vel, this._vel, SHIP_FRICTION);
    if (Math.abs(this._vel[0]) < SHIP_EPS) this._vel[0] = 0;
    if (Math.abs(this._vel[1]) < SHIP_EPS) this._vel[1] = 0;
    vec2.add(this._pos, this._pos, this._vel);

    this._firing = Input.isKeyDown(Input.K_SPACE);

    if (this._firing && !this._beam) {
      this.getManager().add(this._beam = new Beam());
    } else if (!this._firing && this._beam) {
      this.getManager().remove(this._beam);
      this._beam = null;
    }

    if (this._beam) {
      this._beam.updateBoundingBox(
        this._pos[0] + beamOffset[0],
        this._pos[1] + beamOffset[1],
        80 - this._pos[0] - beamOffset[0],
        beamHeight
      );
      var beamId = this._beam.getId();
      this.getCollisions().forEach(function(c) {
        if (c.hasId(beamId) && c.getOpposite(beamId).getType() === 'enemy') {
          c.getOpposite(beamId).kill();
        }
      });
    }

    for (var i = 0; i < 2; i++) {
      var lowerBound = (i === 0) ? -4 : -4;
      var upperBound = (i === 0) ? 50 : 58;
      if (this._pos[i] < lowerBound) {
        this._vel[i] = Math.abs(this._vel[i]) * BOUNCE_FRICTION;
        this._pos[i] = -4;
      }
      if (this._pos[i] > upperBound) {
        this._vel[i] = -Math.abs(this._vel[i]) * BOUNCE_FRICTION;
        this._pos[i] = upperBound;
      }
    }
  }
});

module.exports = Player;

