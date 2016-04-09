
var Base = require('basejs'),
    Utils = require('./Utils');

var SpriteManager = Base.extend({
  init: function() {
    return Promise.all([
      Utils.loadImage('sprites.png'),
      Utils.getJSON('sprites.json')
    ]).then(function(values) {
      this._spriteImage = values[0];
      this._spriteDb = values[1];
    }.bind(this));
  },

  draw: function(ctx, name, x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    var meta = this._spriteDb[name];
    ctx.drawImage(
      this._spriteImage,
      meta.x,
      meta.y,
      meta.width,
      meta.height,
      x,
      y,
      meta.width,
      meta.height
    );
  }
});

module.exports = new SpriteManager();

