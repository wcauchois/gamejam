
var svg = document.getElementById('svg');
var svgns = "http://www.w3.org/2000/svg";

var shapeElements = [];

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        var json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch (e) {}
        if (json) {
          resolve(json);
        } else {
          reject(new Error("Server returned invalid JSON"));
        }
      } else {
        reject(new Error("Server responded with status " + xhr.status + " " + xhr.statusText));
      }
    };
    xhr.onerror = function() {
      reject(new Error("Server responded with status " + xhr.status + " " + xhr.statusText));
    };
    xhr.send();
  });
}

function randInt(n) {
  return Math.floor(Math.random() * (n - 1));
}

for (var y = 0; y < 64; y++) {
  for (var x = 0; x < 64; x++) {
    var shape = document.createElementNS(svgns, 'rect');
    shape.setAttribute('width', '8');
    shape.setAttribute('height', '8');
    shape.setAttribute('x', '' + x * 8);
    shape.setAttribute('y', '' + y * 8);
    shape.style.fill = 'rgba(0, 0, 0, 0)';
    svg.appendChild(shape);
    shapeElements.push(shape);
  }
}

var screenBuf = new Uint8Array(16384);

function renderScreen() {
  for (var i = 0; i < 64 * 64; i++) {
    shapeElements[i].style.fill = 'rgba(' + [
      screenBuf[i * 4 + 0],
      screenBuf[i * 4 + 1],
      screenBuf[i * 4 + 2],
      screenBuf[i * 4 + 3]
    ].join(',') + ')';
  }
}

function clearScreen() {
  screenBuf.fill(0);
}

function drawPixel(x, y, color) {
  x = Math.floor(x);
  y = Math.floor(y);
  screenBuf[(x + y * 64) * 4 + 0] = color[0];
  screenBuf[(x + y * 64) * 4 + 1] = color[1];
  screenBuf[(x + y * 64) * 4 + 2] = color[2];
  screenBuf[(x + y * 64) * 4 + 3] = (color.length > 3) ? color[3] : 255;
}

function drawImage(startX, startY, obj, clearColor) {
  var w = obj.width, h = obj.height;
  startX = Math.floor(startX);
  startY = Math.floor(startY);
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var r = obj.data[(x + y * w) * 3 + 0],
          g = obj.data[(x + y * w) * 3 + 1],
          b = obj.data[(x + y * w) * 3 + 1];
      var alpha = 255;
      if (
        typeof clearColor === 'undefined' ||
        r !== clearColor[0] ||
        g !== clearColor[1] ||
        b !== clearColor[2]
      ) {
        drawPixel(x + startX, y + startY, [r, g, b]);
      }
    }
  }
}

var animSpeed = 0.4;

var Sprite = Base.extend({
  constructor: function(pos) {
    this.pos = pos;
    this.anim = this.getAnim();
    this.animFrame = 0;
  },

  tick: function() {
    this.animFrame += animSpeed;
    if (this.animFrame >= this.anim.length) {
      this.animFrame = 0;
    }
  },

  draw: function(graphics) {
    drawImage(this.pos[0], this.pos[1], graphics[this.anim[Math.floor(this.animFrame)]], C_WHITE);
  }
});

var EnemySprite = Sprite.extend({
  getAnim: function() {
    return ['enemy_0', 'enemy_1', 'enemy_2', 'enemy_3', 'enemy_4'];
  }
});

var K_UP = 38, K_DOWN = 40, K_LEFT = 37, K_RIGHT = 39;
var K_SPACE = 32;
var moveMap = {};
moveMap[K_UP] =  vec2.fromValues(0, -1);
moveMap[K_DOWN] = vec2.fromValues(0, 1);
moveMap[K_LEFT] = vec2.fromValues(-1, 0);
moveMap[K_RIGHT] = vec2.fromValues(1, 0);
var keysDown = {};
var capturedKeys = [K_UP, K_DOWN, K_LEFT, K_RIGHT, K_SPACE];

var C_WHITE = [255, 255, 255],
    C_BEAM_OUTER = [90, 239, 255],
    C_BEAM_INNER = [247, 255, 252];

getJSON('ships.json').then(function(json) {
  window.addEventListener('keydown', function(e) {
    if (capturedKeys.indexOf(e.keyCode) >= 0) {
      e.preventDefault();
      keysDown[e.keyCode] = true;
    }
  });

  window.addEventListener('keyup', function(e) {
    if (capturedKeys.indexOf(e.keyCode) >= 0) {
      e.preventDefault();
      keysDown[e.keyCode] = false;
    }
  });

  var shipPos = vec2.create();
  var shipVel = vec2.create();

  var SHIP_FRICTION = 0.9;
  var SHIP_ACCEL = 0.3;
  var SHIP_EPS = 0.0001;

  var firing = false;

  var enemy = new EnemySprite(vec2.fromValues(35, 15));
  var sprites = [enemy];

  setInterval(function() {
    var indices = Object.keys(keysDown);
    var movementKeys = indices.filter(function(k) { return keysDown[k] && (k in moveMap); });
    movementKeys.forEach(function(k) {
      vec2.scaleAndAdd(shipVel, shipVel, moveMap[k], SHIP_ACCEL);
    });
    if (Math.abs(shipVel[0]) < SHIP_EPS && Math.abs(shipVel[1]) < SHIP_EPS) {
      vec2.set(shipVel, 0, 0);
    }
    vec2.add(shipPos, shipPos, shipVel);
    // XXX this is jank AF
    shipPos[0] = Math.min(Math.max(shipPos[0], 0), 46);
    shipPos[1] = Math.min(Math.max(shipPos[1], 0), 55);
    vec2.scale(shipVel, shipVel, SHIP_FRICTION);

    firing = !!keysDown[K_SPACE];

    sprites.forEach(function(s) { s.tick(); });
  }, 50);

  var kamehaOffset = vec2.fromValues(17, 2);
  var beamOffset = vec2.add(vec2.create(), kamehaOffset, vec2.fromValues(10, 3));
  var beamHeight = 4;

  function animate() {
    var imageToUse;
    if (keysDown[K_UP]) {
      imageToUse = json.ship_up;
    } else if (keysDown[K_DOWN]) {
      imageToUse = json.ship_down;
    } else {
      imageToUse = json.ship;
    }

    clearScreen();

    if (firing) {
      var kamehaPos = vec2.add(vec2.create(), shipPos, kamehaOffset);
      drawImage(kamehaPos[0], kamehaPos[1], json.kameha, C_WHITE);
    }

    drawImage(shipPos[0], shipPos[1], imageToUse, C_WHITE);

    if (firing) {
      for (var x = shipPos[0] + beamOffset[0]; x < 64; x++) {
        for (var y = 0; y < beamHeight; y++) {
          var color = (y === 0 || y === (beamHeight - 1)) ? C_BEAM_OUTER : C_BEAM_INNER;
          drawPixel(x, y + shipPos[1] + beamOffset[1], color);
        }
      }
    }

    sprites.forEach(function(s) { s.draw(json); });

    renderScreen();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

});

/*
getJSON('data.json').then(function(json) {
  requestAnimationFrame(function() {
    for (var i = 0; i < json.data.length / 3; i++) {
      shapeElements[i].style.fill = 'rgb(' + [
        json.data[i * 3 + 0],
        json.data[i * 3 + 1],
        json.data[i * 3 + 2]
      ].join(',') + ')';
    }
  });
});
*/

