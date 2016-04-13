var Base = require('basejs'),
    Utils = require('./Utils'),
    vec2 = require('gl-matrix').vec2;

var PathManager = Base.extend({
  init: function() {
    return Utils.getXML('paths.svg').then(function(svg) {
      this._svgDoc = svg;
      this._preprocessSvg();
    }.bind(this));
  },

  _preprocessSvg: function() {
    var allPaths = Array.prototype.slice.call(this._svgDoc.getElementsByTagName('path'));
  },

  getPath: function(pathName) {
    return this._svgDoc.getElementById(pathName);
  },

  getPointAtLength: function(pathName, length) {
    var svgPoint = this.getPath(pathName).getPointAtLength(length);
    return vec2.fromValues(svgPoint.x, svgPoint.y);
  },

  getTotalLength: function(pathName) {
    return this.getPath(pathName).getTotalLength();
  },

  getPointAtInterp: function(pathName, interp) {
    return this.getPointAtLength(pathName, interp * this.getTotalLength(pathName));
  }
});

module.exports = new PathManager();
global.PathManager = module.exports;

