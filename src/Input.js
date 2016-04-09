var Base = require('basejs'),
    extend = require('extend-object');

var keys = {
  K_UP: 38,
  K_DOWN: 40,
  K_LEFT: 37,
  K_RIGHT: 39,
  K_SPACE: 32
};

var capturedKeys = [
  keys.K_UP,
  keys.K_DOWN,
  keys.K_LEFT,
  keys.K_RIGHT,
  keys.K_SPACE,
];

var Input = Base.extend({
  init: function() {
    this._keysDown = {};

    window.addEventListener('keydown', function(e) {
      this._keysDown[e.keyCode] = true;
      if (capturedKeys.indexOf(e.keyCode) >= 0) {
        e.preventDefault();
      }
    }.bind(this));

    window.addEventListener('keyup', function(e) {
      this._keysDown[e.keyCode] = false;
      if (capturedKeys.indexOf(e.keyCode) >= 0) {
        e.preventDefault();
      }
    }.bind(this));

    return Promise.resolve();
  },

  isKeyDown: function(k) {
    return !!this._keysDown[k];
  }
});

module.exports = new Input();
extend(module.exports, keys);

