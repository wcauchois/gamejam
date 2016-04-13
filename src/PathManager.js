var Base = require('basejs'),
    Utils = require('./Utils'),
    extend = require('extend-object'),
    vec2 = require('gl-matrix').vec2;

var numSamples = 10000;
var batchSize = 1000;

var PathManager = Base.extend({
  init: function() {
    return Utils.getXML('paths.svg').then(function(svg) {
      this._svgDoc = svg;
      return this._preprocessSvg();
    }.bind(this));
  },

  _preprocessSvg: function() {
    var allPaths = Array.prototype.slice.call(this._svgDoc.getElementsByTagName('path'));
    this._paths = {};
    this._pathLengths = {};
    this._pathSamples = {};
    this._pathSamplingQueue = [];
    allPaths.forEach(function(pathElement) {
      this._paths[pathElement.id] = pathElement;
      this._pathLengths[pathElement.id] = pathElement.getTotalLength();
      this._pathSamples[pathElement.id] = new Float32Array(numSamples * 2);
      this._pathSamplingQueue.push({
        element: pathElement,
        totalLength: this._pathLengths[pathElement.id],
        samplesLeft: numSamples,
        sampleArray: this._pathSamples[pathElement.id]
      });
    }.bind(this));
    return this._handleWorkQueue();
  },

  _handleWorkQueue: function() {
    return new Promise(function(resolve, reject) {
      var interval;
      var resolveAndClearInterval = function() {
        clearInterval(interval);
        resolve();
      };
      interval = setInterval(this._handleWorkQueueStep.bind(this, resolveAndClearInterval), 0);
    }.bind(this));
  },

  _handleWorkQueueStep: function(resolve) {
    if (this._pathSamplingQueue.length > 0) {
      var item = this._pathSamplingQueue.pop();
      if (item.samplesLeft > 0) {
        var startIndex = (numSamples - item.samplesLeft);
        for (var i = startIndex; i < startIndex + batchSize; i++) {
          var point = item.element.getPointAtLength((i / numSamples) * item.totalLength);
          item.sampleArray[i * 2 + 0] = point.x;
          item.sampleArray[i * 2 + 1] = point.y;
        }
        this._pathSamplingQueue.push(extend(item, {samplesLeft: item.samplesLeft - batchSize}));
      }
    } else {
      resolve();
    }
  },

  getPath: function(pathName) {
    return this._paths[pathName];
  },

  getTotalLength: function(pathName) {
    return this._pathLengths[pathName];
  },

  getPointAtInterp: function(pathName, interp) {
    var sampleArray = this._pathSamples[pathName];
    var baseIndex = Math.floor(interp * numSamples) * 2;
    return vec2.fromValues(sampleArray[baseIndex + 0], sampleArray[baseIndex + 1]);
  }
});

module.exports = new PathManager();
global.PathManager = module.exports;

