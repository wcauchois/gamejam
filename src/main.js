
var vec2 = require('gl-matrix').vec2,
    Base = require('basejs'),
    SpriteManager = require('./SpriteManager'),
    Input = require('./Input'),
    GameTime = require('./GameTime'),
    Path = require('./Path'),
    PathManager = require('./PathManager'),
    ObjectManager = require('./ObjectManager'),
    GameObject = require('./GameObject'),
    extend = require('extend-object'),
    Player = require('./Player');

var canvas = document.getElementById('c');

var Level = Base.extend({
  constructor: function(spawns) {
    this.spawns = spawns;
  }
});

Level.unpack = function(json) {
  return new Level(json.spawns);
};

var level1 = Level.unpack({
  "spawns": [
    {"type": "enemy1", startTime: 0.0, paths: [{name: 'path1', duration: 15000.0}]},
    {"type": "enemy1", startTime: 5000.0, paths: [{name: 'path2', duration: 15000.0}]},
    {"type": "enemy1", startTime: 5000.0, paths: [{name: 'path1', duration: 3000.0}]}
  ]
});

var Orchestrator = GameObject.extend({
  constructor: function(manager, level) {
    this.base();

    this._manager = manager;
    this._level = level;
    this._active = {};

    this._spawns = level.spawns.slice();
    this._spawns.sort(function(s1, s2) { return s1.startTime - s2.startTime; });
    this._spawns.forEach(function(s) {
      extend(s, {id: Utils.guid(this.getId() + '_')});
    }.bind(this));

    this._spawnIndex = 0;
    this._startTime = GameTime.get();
    console.log("%cOrchestrator started", 'color: green');
  },

  tick: function() {
    var relTime = GameTime.get() - this._startTime;
    // Spawn everything that needs to be spawned
    for (; this._spawnIndex < this._spawns.length &&
      this._spawns[this._spawnIndex].startTime <= relTime; this._spawnIndex++) {

      (function(spawn) {
        if (spawn.startTime <= relTime) {
          this._active[spawn.id] = this._manager.add(new Enemy(spawn));
          console.log("%cSpawned enemy with id " + spawn.id, 'color: pink');
        }
      }).bind(this)(this._spawns[this._spawnIndex]);
    }

    // Update enemy positions
    Object.keys(this._active).forEach(function (activeId) {
      var enemy = this._active[activeId];
      if (this._manager.isAlive(enemy)) {
        var timeSinceSpawn = relTime - enemy.spawn.startTime;
        var pathIndex = 0;
        var paths = enemy.spawn.paths;
        while (pathIndex < paths.length && timeSinceSpawn >= paths[pathIndex].duration) {
          timeSinceSpawn -= paths[pathIndex].duration;
          pathIndex++;
        }
        if (pathIndex >= paths.length) {
          delete this._active[activeId];
          this._manager.remove(enemy);
        } else {
          var interp = timeSinceSpawn / paths[pathIndex].duration;
          if (paths[pathIndex].reverse) {
            interp = 1.0 - interp;
          }
          enemy.setPos(PathManager.getPointAtInterp(paths[pathIndex].name, interp));
        }
      } else {
        delete this._active[activeId];
      }
    }.bind(this));
  }
});

function v2(x, y) { return vec2.fromValues(x, y); }

var EnemyTypes = {
  "enemy1": {"frames": ["enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"],
             "boundingBox": {x: 2, y: 2, width: 8, height: 8}}
};

var PositionedAnimated = GameObject.extend({
  constructor: function(id) {
    this.base(id);
    this._pos = vec2.create();
  },

  setPos: function(newPos) {
    this._pos = vec2.clone(newPos);
  },

  draw: function(ctx) {
    var frames = this.getFrames();
    var currentFrame = Math.floor(GameTime.get() / 100.0) % frames.length;
    SpriteManager.draw(ctx, frames[currentFrame], this._pos[0], this._pos[1]);
  }
});

var Enemy = PositionedAnimated.extend({
  constructor: function(spawn) {
    this.base(spawn.id);
    this.spawn = spawn;
    this._spec = EnemyTypes[spawn.type];
  },

  getFrames: function() {
    return this._spec.frames;
  },

  getBoundingBox: function() {
    return Utils.translateBBox(this._spec.boundingBox, this._pos);
  },

  getType: function() { return 'enemy'; }
});

Promise.all([
  SpriteManager.init(),
  Input.init(),
  GameTime.init(),
  PathManager.init()
]).then(function() {

  var player = new Player();
  var objectManager = new ObjectManager();
  objectManager.add(player);
  var orchestrator = new Orchestrator(objectManager, level1);
  objectManager.add(orchestrator);

  function tick() {
    objectManager.tick();
    GameTime.inc();
  }
  setInterval(tick, 50);
  tick();

  function animate() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    objectManager.draw(ctx);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});

