var Base = require('basejs'),
    GameTime = require('./GameTime');

var GameObject = Base.extend({
  constructor: function(id) {
    this._id = id || Utils.guid(this.getType());
    this._createTime = GameTime.get();
  },
  aliveForHowLong: function() { return GameTime.delta(this._createTime); },
  setManager: function(manager) { this._manager = manager; },
  drawOrder: function() { return 0; },
  getManager: function() { return this._manager; },
  getId: function() { return this._id; },
  tick: function() {},
  draw: function(ctx) {},
  getType: function() { return 'generic'; },
  getBoundingBox: function() { return undefined; },
  kill: function() {
    this.getManager().remove(this);
  },
  getCollisions: function() { return this.getManager().getCollisions(); }
});

module.exports = GameObject;

