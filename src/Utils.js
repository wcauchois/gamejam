
exports.loadImage = function(url) {
  return new Promise(function(resolve, reject) {
    var img = document.createElement('img');
    img.onerror = function() {
      reject(new Error("Failed to load image"));
    };
    img.onload = function() {
      resolve(img);
    };
    img.src = url;
  });
};

var runXHR = function(url, method) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr);
      } else {
        reject(new Error("Server responded with status " + xhr.status + " " + xhr.statusText));
      }
    };
    xhr.onerror = function() {
      reject(new Error("Server responded with status " + xhr.status + " " + xhr.statusText));
    };
    xhr.send();
  });
};

exports.getXML = function(url) {
  return runXHR(url, 'GET').then(function(xhr) {
    return xhr.responseXML;
  });
};

exports.getJSON = function(url) {
  return runXHR(url, 'GET').then(function(xhr) {
    return new Promise(function(resolve, reject) {
      var json;
      try {
        json = JSON.parse(xhr.responseText);
      } catch (e) {}
      if (json) {
        resolve(json);
      } else {
        reject(new Error("Server returned invalid JSON"));
      }
    });
  });
};

exports.doRectsIntersect = function(x1, y1, width1, height1, x2, y2, width2, height2) {
  // http://gamedev.stackexchange.com/a/587
  return (Math.abs(x1 - x2) * 2 < (width1 + width2)) &&
    (Math.abs(y1 - y2) * 2 < (height1 + height2));
};

exports.fillRect = function(ctx, color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
};

exports.translateBBox = function(bbox, vec) {
  return {x: bbox.x + vec[0], y: bbox.y + vec[1], width: bbox.width, height: bbox.height};
};

var guidNumber = 1;
exports.guid = function(prefix) {
  return (prefix || '') + (guidNumber++);
};

global.Utils = module.exports;

