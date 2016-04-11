var GameObject = require('./GameObject'),
    Base = require('basejs'),
    vec2 = require('gl-matrix').vec2,
    GameTime = require('./GameTime'),
    Utils = require('./Utils');

var starColor = 'rgb(255, 255, 255)';

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
      this._color = 'rgba(0, 0, 0, 0)';
    } else if (r < 0.2875) {
      this._color = '#9E9E9E';
    } else if (r < 0.525) {
      this._color = '#A0A0B3';
    } else if (r < 0.7625) {
      this._color = '#FFFFFD';
    } else {
      this._color = '#DDDDDD';
    }
  },

  move: function(delta) { this._pos[0] += delta * this._speed; },
  reset: function() {
    this._pos = vec2.fromValues(65, Utils.randIntBetween(0, 64));
    this._resetColor();
    this._speed = Utils.randIntBetween(10, 15);
  },
  getX: function() { return this._pos[0]; },
  getY: function() { return this._pos[1]; }
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
    this._stars.forEach(function(star) {
      Utils.fillRect(ctx, star.getColor(), star.getX(), star.getY(), 1, 1);
    });
  }
});

module.exports = StarField;
