var Base = require('basejs');

var GameTime = Base.extend({
  init: function() {
    this._epoch = new Date().getTime();
    return Promise.resolve();
  },

  get: function() {
    return (new Date().getTime() - this._epoch);
  },

  delta: function(from) {
    return this.get() - from;
  }
});

module.exports = new GameTime();

