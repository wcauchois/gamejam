var Base = require('basejs');

var GameTime = Base.extend({
  init: function() {
    this._epoch = new Date().getTime();
    this._frame = 0;
    return Promise.resolve();
  },

  get: function() {
    return (new Date().getTime() - this._epoch);
  },

  inc: function() {
    this._frame++;
  },

  getFrame: function() {
    return this._frame;
  },

  delta: function(from) {
    return this.get() - from;
  }
});

module.exports = new GameTime();

