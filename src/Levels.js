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
