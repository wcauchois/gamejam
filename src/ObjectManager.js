var Base = require('basejs'),
    Utils = require('./Utils'),
    GameTime = require('./GameTime');

var Collision = Base.extend({
  constructor: function(object1, object2) {
    this.object1 = object1;
    this.object2 = object2;
  },

  getPair: function() {
    return [this.object1, this.object2];
  },

  hasId: function(id) {
    return this.object1.getId() === id ||
      this.object2.getId() === id;
  },

  getOpposite: function(id) {
    if (this.object1.getId() === id) {
      return this.object2;
    } else {
      return this.object1;
    }
  },

  toString: function() {
    return this.object1.getId() + '/' + this.object2.getId();
  }
});

var ObjectManager = Base.extend({
  constructor: function() {
    this._objects = {};
    this._collisions = [];
  },

  init: function() {
    return Promise.resolve();
  },

  add: function(object) {
    this._objects[object.getId()] = object;
    object.setManager(this);
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

  _calculateCollisions: function() {
    this._collisions = [];
    var objectsWithBoundingBoxes = Object.keys(this._objects)
      .filter(function(k) { return typeof this._objects[k].getBoundingBox() !== 'undefined'; }.bind(this))
      .map(function(k) { return this._objects[k]; }.bind(this));
    objectsWithBoundingBoxes.forEach(function(o1) {
      objectsWithBoundingBoxes.forEach(function(o2) {
        if (o1.getId() < o2.getId()) {
          var bb1 = o1.getBoundingBox(),
              bb2 = o2.getBoundingBox();
          if (Utils.doRectsIntersect(
            bb1.x,
            bb1.y,
            bb1.width,
            bb1.height,
            bb2.x,
            bb2.y,
            bb2.width,
            bb2.height
          )) {
            this._collisions.push(new Collision(o1, o2));
          }
        }
      }.bind(this));
    }.bind(this));
  },

  getCollisions: function() {
    return this._collisions;
  },

  tick: function() {
    this._calculateCollisions();
    this.forEach(function(o) { o.tick(); });
  },

  draw: function(ctx) {
    var objectsToDraw = [];
    this.forEach(function(o) { objectsToDraw.push(o); });
    objectsToDraw.sort(function(o1, o2) { return o1.drawOrder() - o2.drawOrder(); });
    objectsToDraw.forEach(function(o) { o.draw(ctx); });
  },

  isAlive: function(o) {
    return !!this._objects[o.getId()];
  }
});

ObjectManager.Collision = Collision;
module.exports = ObjectManager;

