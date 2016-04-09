
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

global.Utils = module.exports;

