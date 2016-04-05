
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
        typeof clearColor !== 'undefined' &&
        r === clearColor[0] &&
        g === clearColor[1] &&
        b === clearColor[2]
      ) {
        alpha = 0;
      }
      screenBuf[((x + startX) + (y + startY) * 64) * 4 + 0] = r;
      screenBuf[((x + startX) + (y + startY) * 64) * 4 + 1] = g;
      screenBuf[((x + startX) + (y + startY) * 64) * 4 + 2] = b;
      screenBuf[((x + startX) + (y + startY) * 64) * 4 + 3] = alpha;
    }
  }
}

var K_UP = 38, K_DOWN = 40, K_LEFT = 37, K_RIGHT = 39;
var moveMap = {};
moveMap[K_UP] =  vec2.fromValues(0, -1);
moveMap[K_DOWN] = vec2.fromValues(0, 1);
moveMap[K_LEFT] = vec2.fromValues(-1, 0);
moveMap[K_RIGHT] = vec2.fromValues(1, 0);
var keysDown = {};

getJSON('ships.json').then(function(json) {
  window.addEventListener('keydown', function(e) {
    if (e.keyCode in moveMap) {
      e.preventDefault();
      keysDown[e.keyCode] = true;
    }
  });

  window.addEventListener('keyup', function(e) {
    if (e.keyCode in moveMap) {
      e.preventDefault();
      keysDown[e.keyCode] = false;
    }
  });

  var shipPos = vec2.create();
  var shipVel = vec2.create();

  var SHIP_FRICTION = 0.9;
  var SHIP_ACCEL = 0.3;
  var SHIP_EPS = 0.0001;

  setInterval(function() {
    var indices = Object.keys(keysDown);
    var keys = indices.filter(function(i) { return keysDown[i]; });
    keys.forEach(function(k) {
      var dir = moveMap[k];
      if (dir) {
        vec2.scaleAndAdd(shipVel, shipVel, dir, SHIP_ACCEL);
      }
    });
    if (Math.abs(shipVel[0]) < SHIP_EPS && Math.abs(shipVel[1]) < SHIP_EPS) {
      vec2.set(shipVel, 0, 0);
    }
    vec2.add(shipPos, shipPos, shipVel);
    vec2.scale(shipVel, shipVel, SHIP_FRICTION);
  }, 50);

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
    drawImage(shipPos[0], shipPos[1], imageToUse, [255, 255, 255]);
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

