var GameObject = require('./GameObject'),
    Base = require('basejs'),
    vec2 = require('gl-matrix').vec2,
    GameTime = require('./GameTime'),
    Utils = require('./Utils');

var NUM_STARS = 13;
var FIELD_SPEED = 0.02;

var Star = Base.extend({
  constructor: function(pos) {
    this._speed = 1.0;
    this.reset();
    this._pos = pos;
  },

  getColor: function() {
    return this._color;
  },

  _resetColor: function() {
    var r = Math.random();
    if (r < 0.05) {
      this._color = [0, 0, 0, 0];
    } else if (r < 0.2875) {
      this._color = [158, 158, 158, 255];
    } else if (r < 0.525) {
      this._color = [160, 160, 179, 255];
    } else if (r < 0.7625) {
      this._color = [255, 255, 253, 255];
    } else {
      this._color = [221, 221, 221, 255];
    }
  },

  move: function(delta) { this._pos[0] += delta * this._speed; },
  reset: function() {
    this._pos = vec2.fromValues(65, Utils.randIntBetween(0, 64));
    this._resetColor();
    this._speed = Utils.randIntBetween(10, 15);
  },
  getX: function() { return Math.floor(this._pos[0]); },
  getY: function() { return Math.floor(this._pos[1]); }
});

var StarField = GameObject.extend({
  drawOrder: function() { return -999; },

  constructor: function() {
    this.base();
    this._stars = [];
    for (var i = 0; i < NUM_STARS; i++) {
      this._stars.push(new Star(vec2.fromValues(
        Utils.randIntBetween(0, 64),
        Utils.randIntBetween(0, 64)
      )));
    }
  },

  tick: function() {
    this._stars.forEach(function(star) {
      star.move(-FIELD_SPEED);
      if (star.getX() < 0) {
        star.reset();
      }
    });
  },

  draw: function(ctx) {
    var imageData = ctx.createImageData(64, 64);
    this._stars.forEach(function(star) {
      var color = star.getColor();
      var baseIndex = (star.getX() + star.getY() * 64) * 4;
      imageData.data[baseIndex + 0] = color[0];
      imageData.data[baseIndex + 1] = color[1];
      imageData.data[baseIndex + 2] = color[2];
      imageData.data[baseIndex + 3] = color[3];
    });
    ctx.putImageData(imageData, 0, 0);
  }
});

module.exports = StarField;
