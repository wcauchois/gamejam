
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
    /*
    var r = randInt(256),
        g = randInt(256),
        b = randInt(256);
    shape.style.fill = 'rgb(' + [r, g, b].join(',') + ')';
    */
    svg.appendChild(shape);
    shapeElements.push(shape);
  }
}

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

