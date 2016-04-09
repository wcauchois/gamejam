
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

exports.getJSON = function(url) {
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
};

