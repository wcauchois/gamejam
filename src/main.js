
var vec2 = require('gl-matrix').vec2,
    Base = require('basejs'),
    SpriteManager = require('./SpriteManager'),
    Input = require('./Input'),
    GameTime = require('./GameTime'),
    Path = require('./Path'),
    PathManager = require('./PathManager'),
    ObjectManager = require('./ObjectManager'),
    GameObject = require('./GameObject'),
    extend = require('extend-object');

var canvas = document.getElementById('c');

var SHIP_FRICTION = 0.9;
var SHIP_ACCEL = 0.3;
var SHIP_EPS = 0.0001;

var Player = GameObject.extend({
  constructor: function() {
    this.base();
    this._pos = vec2.create();
    this._vel = vec2.create();

    this._moveMap = {};
    this._moveMap[Input.K_UP] =  vec2.fromValues(0, -1);
    this._moveMap[Input.K_DOWN] = vec2.fromValues(0, 1);
    this._moveMap[Input.K_LEFT] = vec2.fromValues(-1, 0);
    this._moveMap[Input.K_RIGHT] = vec2.fromValues(1, 0);
  },

  draw: function(ctx) {
    var spriteName;
    if (Input.isKeyDown(Input.K_UP)) {
      spriteName = 'ship_up';
    } else if (Input.isKeyDown(Input.K_DOWN)) {
      spriteName = 'ship_down';
    } else {
      spriteName = 'ship';
    }
    SpriteManager.draw(ctx, spriteName, this._pos[0], this._pos[1]);
  },

  tick: function() {
    for (var k in this._moveMap) {
      if (this._moveMap.hasOwnProperty(k)) {
        if (Input.isKeyDown(k)) {
          vec2.scaleAndAdd(this._vel, this._vel, this._moveMap[k], SHIP_ACCEL);
        }
      }
    }
    vec2.scale(this._vel, this._vel, SHIP_FRICTION);
    if (Math.abs(this._vel[0]) < SHIP_EPS) this._vel[0] = 0;
    if (Math.abs(this._vel[1]) < SHIP_EPS) this._vel[1] = 0;
    vec2.add(this._pos, this._pos, this._vel);
    /*
    // XXX this is jank AF
    shipPos[0] = Math.min(Math.max(shipPos[0], 0), 46);
    shipPos[1] = Math.min(Math.max(shipPos[1], 0), 55);
    */
  }
});

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
  "enemy1": {"frames": ["enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"]}
};

var Enemy = GameObject.extend({
  constructor: function(spawn) {
    this.base(spawn.id);

    this.spawn = spawn;

    this._pos = vec2.create();
    this._spec = EnemyTypes[spawn.type];
  },

  setPos: function(newPos) {
    this._pos = vec2.clone(newPos);
  },

  draw: function(ctx) {
    var currentFrame = Math.floor(GameTime.get() / 100.0) % this._spec.frames.length;
    SpriteManager.draw(ctx, this._spec.frames[currentFrame], this._pos[0], this._pos[1]);
  }
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

