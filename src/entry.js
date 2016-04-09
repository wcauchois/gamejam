
var vec2 = require('gl-matrix').vec2,
    Base = require('basejs'),
    SpriteManager = require('./SpriteManager');

var canvas = document.getElementById('c');
SpriteManager.init().then(function() {
  var ctx = canvas.getContext('2d');
  SpriteManager.draw(ctx, 'ship', 0, 0);
});

console.log("hello world");
console.log(vec2);

