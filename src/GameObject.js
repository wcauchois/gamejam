var Base = require('basejs');

var GameObject = Base.extend({
  constructor: function(id) {
    this._id = id || Utils.guid(this.getType());
  },
  setManager: function(manager) { this._manager = manager; },
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

