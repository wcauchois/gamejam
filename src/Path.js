var Base = require('basejs'),
    GameTime = require('./GameTime'),
    vec2 = require('gl-matrix').vec2,
    easing = require('./easing');

function vec2apply(func, v1, v2) {
  return vec2.fromValues(
    func(v1[0], v2[0]),
    func(v1[1], v2[1])
  );
}

var Component = Base.extend({
  constructor: function(duration, easing) {
    this._duration = duration;
    this._easing = easing || 'linear';
  },

  interpolate: function(relTime, begin, end) {
    relTime = Math.max(0, Math.min(relTime, this._duration));
    var easeFunc = (typeof this._easing === 'function') ? this._easing : easing.functions[this._easing];
    return easeFunc(relTime / this._duration, begin, end); 
  },

  getDuration: function() {
    return this._duration;
  }
});

var LineComponent = Component.extend({
  constructor: function(startPos, endPos, duration) {
    this.base(duration);
    this._startPos = startPos;
    this._endPos = endPos;
  },

  getValue: function(relTime) {
    return vec2apply(this.interpolate.bind(this, relTime), this._startPos, this._endPos);
  }
});

var Path = Base.extend({
  constructor: function(components) {
    this._components = components || [];
  },

  getValue: function(relTime) {
    var totalDuration = this._components.reduce(function(d, c) { return d + c.getDuration(); }, 0);
    var currentComponent = this._components[this._components.length - 1];
    if (relTime < totalDuration) {
      var time = 0;
      for (var i = 0; i < this._components.length; i++) {
        if (time + this._components[i].getDuration() >= relTime) {
          currentComponent = this._components[i];
          break;
        }
        time += this._components[i].getDuration();
      }
      return currentComponent.getValue(relTime - time);
    } else {
      return currentComponent.getValue(totalDuration);
    }
  }
});

exports.LineComponent = LineComponent;
exports.Path = Path;

