"use strict"

const ElgatoKeyLightPlugin = require('./plugins/elgato-key-light.js')
const SpotifyPlugin = require('./plugins/spotify.js')
const LifxPlugin = require('./plugins/lifx.js')

class PluginManager {
  constructor() {
    this.plugins = [
      new ElgatoKeyLightPlugin(),
      new SpotifyPlugin(),
      new LifxPlugin()
    ]
  }

  menuItems() {
    let items = []
    for (var i in this.plugins) {
      var plugin = this.plugins[i]
      if (plugin && plugin.menuItems) {
        items = items.concat(plugin.menuItems())
      }
    }

    return items
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
