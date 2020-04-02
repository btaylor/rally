"use strict"

const LightPlugin = require('./plugins/light.js')

class PluginManager {
  constructor() {
    this.plugins = [
      new LightPlugin()
    ]
  }

  beginActiveCall() {
    for (var i in this.plugins) {
      var plugin = this.plugins[i]
      if (plugin && plugin.beginActiveCall) {
        plugin.beginActiveCall()
      }
    }
  }

  endActiveCall() {
    for (var i in this.plugins) {
      var plugin = this.plugins[i]
      if (plugin && plugin.endActiveCall) {
        plugin.endActiveCall()
      }
    }
  }

  appClosed() {
    for (var i in this.plugins) {
      var plugin = this.plugins[i]
      if (plugin && plugin.appClosed) {
        plugin.appClosed()
      }
    }
  }
}

module.exports = PluginManager
