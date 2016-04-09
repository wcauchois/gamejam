
var vec2 = require('gl-matrix').vec2,
    Base = require('basejs'),
    SpriteManager = require('./SpriteManager'),
    Input = require('./Input'),
    GameTime = require('./GameTime'),
    Path = require('./Path');

var canvas = document.getElementById('c');

var GameObject = Base.extend({
});

var SHIP_FRICTION = 0.9;
var SHIP_ACCEL = 0.3;
var SHIP_EPS = 0.0001;

var Player = GameObject.extend({
  constructor: function() {
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

function v2(x, y) { return vec2.fromValues(x, y); }

var Enemy = GameObject.extend({
  constructor: function() {
    this._pos = vec2.create();
    this._startTime = GameTime.get();
    this._path = new Path.Path([
      new Path.LineComponent(v2(30, 0), v2(30, 30), 1000, 'linear'),
      new Path.LineComponent(v2(30, 30), v2(30, 0), 1000, 'linear'),
      new Path.LineComponent(v2(30, 0), v2(0, 30), 1000, 'easeInQuad'),
      new Path.LineComponent(v2(0, 30), v2(45, 0), 1000, 'easeOutQuad'),
    ]);
  },

  tick: function() {
    this._pos = this._path.getValue(GameTime.delta(this._startTime));
  },

  draw: function(ctx) {
    var currentFrame = Math.floor(GameTime.get() / 100.0) % 5;
    SpriteManager.draw(ctx, 'enemy_' + currentFrame, this._pos[0], this._pos[1]);
  }
});

Promise.all([
  SpriteManager.init(),
  Input.init(),
  GameTime.init()
]).then(function() {

  var player = new Player();
  var objects = [player, new Enemy()];

  function tick() {
    objects.forEach(function(o) { o.tick(); });
  }
  setInterval(tick, 50);
  tick();

  function animate() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    objects.forEach(function(o) { o.draw(ctx); });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});

