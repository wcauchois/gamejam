var Base = require('basejs');

var ObjectManager = Base.extend({
  constructor: function() {
    this._objects = {};
  },

  init: function() {
    return Promise.resolve();
  },

  add: function(object) {
    this._objects[object.getId()] = object;
    return object;
  },

  addAll: function(objects) {
    objects.forEach(function(o) { this.add(o); }.bind(this));
  },

  remove: function(object) {
    this.removeById(object.getId());
  },

  removeById: function(id) {
    setTimeout(function() {
      delete this._objects[id];
    }.bind(this), 0);
  },

  forEach: function(func) {
    Object.keys(this._objects).forEach(function(k) {
      func(this._objects[k]);
    }.bind(this));
  },

  tick: function() {
    this.forEach(function(o) { o.tick(); });
  },

  draw: function(ctx) {
    this.forEach(function(o) { o.draw(ctx); });
  },

  isAlive: function(o) {
    return !!this._objects[o.getId()];
  }
});

module.exports = ObjectManager;

