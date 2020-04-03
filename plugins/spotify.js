"use strict"

const spotify = require('spotify-node-applescript')

class SpotifyPlugin {
  constructor() {
    this.previouslyPaused = false
  }

  menuItems() {
    return []
  }

  beginActiveCall() {
    spotify.getState((err, state) => {
      this.previouslyPaused = (state.state === 'playing')
      if (this.previouslyPaused) {
        spotify.pause()
      }
    })
  }

  endActiveCall() {
    if (this.previouslyPaused) {
      spotify.play()
    }
  }
}

module.exports = SpotifyPlugin
