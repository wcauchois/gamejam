var Base = require('basejs'),
    extend = require('extend-object');

var Level = Base.extend({
  constructor: function(spawns) {
    this.spawns = spawns;
  }
});

Level.unpack = function(json) {
  return new Level(json.spawns);
};

exports.Level = Level;

var LevelBuilder = Base.extend({
  constructor: function() {
    this._time = 0;
    this._spawns = [];
    this._defaultDuration = 5000.0;
    this._repeating = false;
    this._repeatState = {};
    this._repeatBuffer = [];
  },

  _saveState: function() {
    return {
      defaultDuration: this._defaultDuration
    };
  },

  _restoreState: function(state) {
    this._defaultDuration = state.defaultDuration;
  },

  beginRepeat: function() {
    this._repeating = true;
    this._repeatState = this._saveState();
    this._repeatBuffer = [];
    return this;
  },

  repeat: function(n) {
    var currentState = this._saveState();
    this._repeating = false;
    for (var i = 0; i < n - 1; i++) {
      this._repeatBuffer.forEach(function(item) {
        this._restoreState(this._repeatState);
        var methodName = item[0], args = item[1];
        this[methodName].apply(this, args);
      }.bind(this));
    }
    this._restoreState(currentState);
    return this;
  },

  _maybeRecord: function(methodName, args) {
    if (this._repeating) {
      args = Array.prototype.slice.call(args);
      this._repeatBuffer.push([methodName, args]);
    }
  },

  // Very lenient in its args
  spawn: function() {
    this._maybeRecord('spawn', arguments);
    var enemies = [];
    if (typeof arguments[0] === 'array') {
      enemies = arguments[0];
    } else {
      enemies = Array.prototype.slice.call(arguments);
    }
    var time = this._time;
    enemies = enemies.map(function(e) {
      return extend(typeof e === 'function' ? e.call(this) : e, {startTime: time});
    }.bind(this));
    this._spawns = this._spawns.concat(enemies);
    return this;
  },

  wait: function(duration) {
    this._maybeRecord('wait', arguments);
    this._time += duration;
    return this;
  },

  defaultDuration: function(duration) {
    this._maybeRecord('defaultDuration', arguments);
    this._defaultDuration = duration;
    return this;
  },

  build: function() {
    return new Level(this._spawns);
  }
});

function enemyBuilder(typeName) {
  return function(pathName, duration) {
    return function() {
      return {
        "type": typeName,
        "paths": [{"name": pathName, duration: (duration || this._defaultDuration)}]
      };
    };
  };
}

LevelBuilder.begin = function() { return new LevelBuilder(); };

var smallship = enemyBuilder('smallship');
var enemy1 = enemyBuilder('enemy1');

var level1 = (
  LevelBuilder.begin()
    .beginRepeat()
    .spawn(smallship('diag_top'), smallship('diag_bottom'))
    .wait(5000.0)
    .spawn(smallship('mid1'), smallship('mid2'), smallship('mid3'))
    .wait(3000.0)
    .spawn(enemy1('roundabout'))
    .wait(1000.0)
    .spawn(smallship('mid1'), smallship('mid2'))
    .wait(3000.0)
    .spawn(smallship('diag_top'), smallship('mid3'))
    .wait(1500.0)
    .spawn(enemy1('mid2'), enemy1('diag_bottom'))
    .defaultDuration(4000.0)
    .wait(1500.0)
    .spawn(smallship('mid_squig', 2000.0), enemy1('diag_top'), enemy1('diag_bottom'))
    .wait(3000.0)
    .spawn(enemy1('mid1'), enemy1('mid2'), enemy1('mid3'), smallship('diag_top', 1500.0))
    .wait(500.0)
    .spawn(smallship('diag_bottom', 2000.0))
    .wait(1500.0)
    .spawn(enemy1('mid1'), smallship('mid2'), smallship('diag_bottom', 3000.0))
    .repeat(5)
    .build()
);

exports.level1 = level1;
global.level1 = level1;

/*
var tempdata = [
  {"type": "smallship", startTime: 0.0, paths: [{name: 'path1', duration: 15000.0}]},
  {"type": "smallship", startTime: 5000.0, paths: [{name: 'path2', duration: 15000.0}]},
  {"type": "smallship", startTime: 5000.0, paths: [{name: 'path1', duration: 3000.0}]},
  {"type": "smallship", startTime: 10000.0, paths: [{name: 'path3', duration: 7000.0}]},
  {"type": "smallship", startTime: 10000.0, paths: [{name: 'path1', duration: 7000.0}]},
  {"type": "smallship", startTime: 10000.0, paths: [{name: 'path2', duration: 7000.0}]}
];
var level1data = [];
for (var i = 0; i < 10; i++) {
  tempdata.forEach(function(t) {
    level1data.push(extend({}, t, {startTime: t.startTime + i * 10000.0}));
  });
}

var level1 = Level.unpack({spawns: level1data});
exports.level1 = level1;
*/
