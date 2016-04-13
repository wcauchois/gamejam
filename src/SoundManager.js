var Base = require('basejs'),
    Utils = require('./Utils');

// http://www.html5rocks.com/en/tutorials/webaudio/intro/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var Sound = Base.extend({
  constructor: function(buffer, name, manager) {
    this._buffer = buffer;
    this._name = name;
    this._manager = manager;
  },

  getBuffer: function() {
    return this._buffer;
  },

  play: function() {
    this._manager.play(this);
  }
});

var localStorageKey = 'sounds_enabled';

var SoundManager = Base.extend({
  constructor: function() {
    this._context = new AudioContext();
    this._sounds = {};
    var soundsEnabledFromStorage = window.localStorage.getItem(localStorageKey);
    this._soundsEnabled = (soundsEnabledFromStorage !== null) ? (soundsEnabledFromLocalStorage === 'true') : true;
  },

  setSoundsEnabled: function(newSoundsEnabled) {
    this._soundsEnabled = newSoundsEnabled;
    window.localStorage.setItem(localStorageKey, newSoundsEnabled.toString());
  },

  init: function() {
    return Promise.all([
      this.loadSound('sound/explode1.ogg'),
      this.loadSound('sound/laser1.ogg')
    ]);
  },

  play: function(soundOrName) {
    var sound = typeof soundOrName === 'string' ? this._sounds[soundOrName] : soundOrName;
    var source = this._context.createBufferSource();
    source.buffer = sound.getBuffer();
    source.connect(this._context.destination);
    source.start(0);
  },

  loadSound: function(path) {
    var soundName = Utils.pathBasename(path);
    if (this._sounds.hasOwnProperty(soundName)) {
      return Promise.resolve(this._sounds[soundName]);
    } else {
      return Utils.getBinary(path).then(function(response) {
        return new Promise(function(resolve, reject) {
          this._context.decodeAudioData(response, function(buffer) {
            console.log("%cLoaded sound '" + soundName + "'", "color: green");
            var sound = new Sound(buffer, soundName, this);
            this._sounds[soundName] = sound;
            resolve(sound);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }
});

module.exports = new SoundManager();
global.SoundManager = module.exports;
