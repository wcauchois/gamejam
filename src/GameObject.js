var Base = require('basejs');

var GameObject = Base.extend({
  constructor: function(id) {
    this._id = id || Utils.guid(this.getType());
  },
  getId: function() { return this._id; },
  tick: function() {},
  draw: function(ctx) {},
  getType: function() { return 'generic'; }
});

module.exports = GameObject;

